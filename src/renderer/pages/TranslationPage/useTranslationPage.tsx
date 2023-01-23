import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { useEvents } from 'renderer/hooks';
import TranslationFromReducer, { defaultState } from './TranslationFromReducer';
import GameModuleContext from 'renderer/contexts/GameModuleContext';
import TranslationsContext from 'renderer/contexts/TranslationsContext';

const useTranslationPage = () => {
  const { module } = useContext(GameModuleContext);
  const {
    translations,
    gameLocale: locale,
    setTranslations,
    setGameLocale,
  } = useContext(TranslationsContext);
  const isModuleView = useMemo(() => !!module, [module]);
  /**  */
  const [languages, setLanguages] = useState<string[]>([]);
  /**  */
  const { sendMessage, on } = useEvents();
  const [state, dispatch] = useReducer(TranslationFromReducer, defaultState);
  const { translationForm } = state;
  const currentTranslations = useMemo(() => {
    if (translations === undefined || Object.keys(translations).length === 0) {
      return null;
    }
    return translations[locale] || translations[Object.keys(translations)[0]];
  }, [translations, locale]);
  /** */

  const appendLocale = useCallback(
    (locale: string) => {
      if (locale === '') return;
      sendMessage('set-languages', [...languages, locale]);
      setTranslations((_translations: any) => {
        _translations[locale] = [];
        currentTranslations?.forEach(({ key, deletable, editable }) => {
          _translations[locale].push({
            key,
            text: '',
            editable: deletable || false,
            deletable: editable || false,
          });
        });
        sendMessage('save-translations', _translations);
        return JSON.parse(JSON.stringify(_translations));
      });
      dispatch({ type: 'hide-form' });
    },
    [currentTranslations, languages]
  );

  const removeLocale = useCallback(
    (language: string) => {
      setLanguages((_languages) => {
        _languages = JSON.parse(
          JSON.stringify(_languages.filter((l) => l !== language))
        );
        sendMessage('remove-language', { language, languages: _languages });
        setGameLocale(_languages[0]);
        dispatch({ type: 'hide-form' });
        return _languages;
      });
    },
    [languages]
  );

  const deleteTranslation = useCallback((key: string) => {
    setTranslations((_translations) => {
      Object.keys(_translations).forEach((code: string) => {
        _translations[code] = _translations[code].filter(
          (translation) => translation.key !== key
        );
      });
      sendMessage('save-translations', _translations);
      return JSON.parse(JSON.stringify(_translations));
    });
    dispatch({ type: 'hide-form' });
  }, []);

  const createTranslationKey = useCallback(() => {
    dispatch({ type: 'show-create-form', data: { languages } });
  }, [languages]);

  const updateTranslationKey = useCallback(
    (key: string) => {
      const formatValues = () => {
        const values: {
          code: string;
          value: string;
          editable?: boolean;
          deletable?: boolean;
        }[] = [];
        languages.forEach((code) => {
          const translation = translations[code].find(
            (translation) => translation.key === key
          );
          values.push({
            code,
            value: translation?.text || '',
            editable: translation?.editable,
            deletable: translation?.deletable,
          });
        });

        return values;
      };
      dispatch({ type: 'hide-form' });
      setTimeout(() =>
        dispatch({
          type: 'show-update-form',
          data: {
            keyTranslation: key,
            values: formatValues(),
          },
        })
      );
    },
    [translations, languages]
  );

  const appendTranslation = useCallback((createTranslations: any) => {
    setTranslations((_translations) => {
      Object.keys(createTranslations).forEach((code) => {
        const tt = _translations[code];
        const key = createTranslations[code].key;
        let value = tt.find((ttt) => ttt.key === key);
        if (value) {
          const { text, editable, deletable } = createTranslations[code];
          value.text = text;
          value.editable = editable;
          value.deletable = deletable;
        } else {
          _translations[code].push({ ...createTranslations[code] });
        }
      });

      dispatch({ type: 'hide-form' });
      sendMessage('save-translations', _translations);
      return JSON.parse(JSON.stringify(_translations));
    });
  }, []);
  useEffect(() => {
    sendMessage('languages-authorized');
    on('languages-authorized', (args: { code: string }[]) => {
      setLanguages(args.map((arg) => arg.code));
    });
  }, []);

  useEffect(() => {
    dispatch({ type: 'hide-form' });
  }, [locale]);

  return {
    module,
    locale,
    currentTranslations,
    languages,
    translationForm,
    isModuleView,
    appendLocale,
    deleteTranslation,
    removeLocale,
    createTranslationKey,
    appendTranslation,
    updateTranslationKey,
    changeGameCurrentLocale: setGameLocale,
  };
};

export default useTranslationPage;
