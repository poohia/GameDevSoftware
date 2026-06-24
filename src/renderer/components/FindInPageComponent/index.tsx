import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'renderer/semantic-ui';
import { Icon } from 'semantic-ui-react';
import DarkModeContext from 'renderer/contexts/DarkModeContext';

type FindInPageResult = {
  activeMatchOrdinal?: number;
  matches?: number;
};

const HIGHLIGHT_ATTRIBUTE = 'data-game-dev-find-highlight';
const OVERLAY_ATTRIBUTE = 'data-game-dev-find-overlay';

const FindInPageComponent: React.FC = () => {
  const { darkModeActived } = useContext(DarkModeContext);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<FindInPageResult>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const matchesRef = useRef<HTMLSpanElement[]>([]);

  const focusInput = useCallback(() => {
    const refocus = () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };

    refocus();
    setTimeout(refocus, 0);
    setTimeout(refocus, 50);
  }, []);

  const setMatchStyle = useCallback((match: HTMLSpanElement, active: boolean) => {
    match.style.background = active ? '#f2711c' : '#ffe066';
    match.style.color = '#1b1c1d';
    match.style.borderRadius = '2px';
    match.style.padding = '0 1px';
  }, []);

  const selectMatch = useCallback(
    (index: number) => {
      const matches = matchesRef.current;
      if (matches.length === 0) {
        setResult({});
        return;
      }

      const nextIndex = ((index % matches.length) + matches.length) % matches.length;
      matches.forEach((match, matchIndex) => {
        setMatchStyle(match, matchIndex === nextIndex);
      });
      matches[nextIndex].scrollIntoView({
        block: 'center',
        inline: 'nearest',
      });
      setResult({
        activeMatchOrdinal: nextIndex + 1,
        matches: matches.length,
      });
      focusInput();
    },
    [focusInput, setMatchStyle]
  );

  const clearHighlights = useCallback(() => {
    const highlights = document.querySelectorAll<HTMLSpanElement>(
      `[${HIGHLIGHT_ATTRIBUTE}="true"]`
    );

    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      if (!parent) {
        return;
      }

      parent.replaceChild(
        document.createTextNode(highlight.textContent || ''),
        highlight
      );
      parent.normalize();
    });

    matchesRef.current = [];
    setResult({});
  }, []);

  const shouldIgnoreNode = useCallback((node: Node) => {
    const parent = node.parentElement;
    if (!parent) {
      return true;
    }

    return !!parent.closest(
      `[${OVERLAY_ATTRIBUTE}="true"], [${HIGHLIGHT_ATTRIBUTE}="true"], script, style, noscript, input, textarea, select, [contenteditable="true"]`
    );
  }, []);

  const getSelectedPageText = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return '';
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return '';
    }

    const range = selection.getRangeAt(0);
    const container =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement;

    if (container?.closest(`[${OVERLAY_ATTRIBUTE}="true"]`)) {
      return '';
    }

    return selectedText;
  }, []);

  const highlightSearch = useCallback(
    (text: string) => {
      clearHighlights();

      const searchText = text.trim();
      if (!searchText) {
        focusInput();
        return;
      }

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (shouldIgnoreNode(node)) {
              return NodeFilter.FILTER_REJECT;
            }

            return node.textContent
              ?.toLowerCase()
              .includes(searchText.toLowerCase())
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );
      const nodes: Text[] = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        nodes.push(currentNode as Text);
        currentNode = walker.nextNode();
      }

      const nextMatches: HTMLSpanElement[] = [];

      nodes.forEach((node) => {
        const content = node.textContent || '';
        const lowerContent = content.toLowerCase();
        const lowerSearchText = searchText.toLowerCase();
        const fragment = document.createDocumentFragment();
        let currentIndex = 0;
        let matchIndex = lowerContent.indexOf(lowerSearchText);

        while (matchIndex !== -1) {
          fragment.appendChild(
            document.createTextNode(content.slice(currentIndex, matchIndex))
          );

          const highlight = document.createElement('span');
          highlight.setAttribute(HIGHLIGHT_ATTRIBUTE, 'true');
          highlight.textContent = content.slice(
            matchIndex,
            matchIndex + searchText.length
          );
          setMatchStyle(highlight, false);
          nextMatches.push(highlight);
          fragment.appendChild(highlight);

          currentIndex = matchIndex + searchText.length;
          matchIndex = lowerContent.indexOf(lowerSearchText, currentIndex);
        }

        fragment.appendChild(document.createTextNode(content.slice(currentIndex)));
        node.parentNode?.replaceChild(fragment, node);
      });

      matchesRef.current = nextMatches;
      selectMatch(0);
    },
    [clearHighlights, focusInput, selectMatch, setMatchStyle, shouldIgnoreNode]
  );

  const stopSearch = useCallback(() => {
    clearHighlights();
    setSearch('');
    setOpen(false);
  }, [clearHighlights]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        event.stopPropagation();
        const selectedText = getSelectedPageText();
        if (selectedText) {
          setSearch(selectedText);
        }
        setOpen(true);
        focusInput();
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        event.stopPropagation();
        stopSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [focusInput, getSelectedPageText, open, stopSearch]);

  useEffect(() => {
    if (!open) {
      return;
    }

    focusInput();
  }, [focusInput, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => highlightSearch(search), 500);
    return () => clearTimeout(timeout);
  }, [highlightSearch, open, search]);

  useEffect(() => {
    return () => clearHighlights();
  }, [clearHighlights]);

  if (!open) {
    return null;
  }

  const matches = result.matches || 0;
  const activeMatch = result.activeMatchOrdinal || 0;
  const colors = darkModeActived
    ? {
        background: '#1b1c1d',
        border: '#3a3f44',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.45)',
        text: '#f5f5f5',
        inputBackground: '#2b2f33',
        inputBorder: '#4a4f55',
      }
    : {
        background: '#fff',
        border: '#d4d4d5',
        boxShadow: '0 2px 10px rgba(34, 36, 38, 0.15)',
        text: '#1b1c1d',
        inputBackground: '#fff',
        inputBorder: '#d4d4d5',
      };

  return (
    <div
      {...{ [OVERLAY_ATTRIBUTE]: 'true' }}
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        color: colors.text,
        background: colors.background,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.boxShadow,
      }}
    >
      <input
        ref={inputRef}
        placeholder="Search..."
        style={{
          width: 220,
          height: 32,
          padding: '0 10px',
          color: colors.text,
          background: colors.inputBackground,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: 4,
          outline: 'none',
        }}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const activeMatchIndex = (result.activeMatchOrdinal || 1) - 1;
            selectMatch(activeMatchIndex + (event.shiftKey ? -1 : 1));
          }
        }}
      />
      <span style={{ minWidth: 48, textAlign: 'center', color: colors.text }}>
        {search.trim() ? `${activeMatch} / ${matches}` : '0 / 0'}
      </span>
      <Button basic icon size="small" type="button" onClick={stopSearch}>
        <Icon name="close" />
      </Button>
    </div>
  );
};

export default FindInPageComponent;
