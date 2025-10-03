import { useEffect, useMemo, useState } from 'react';
import { Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ShortcutsFolder, Translation } from 'types';
import { useDatabase } from 'renderer/hooks';
import {
  DialogShortcutsFoldersComponent,
  DropdownShortcutsFoldersComponent,
} from 'renderer/components';

type TranslationTableComponentProps = {
  translations: Translation[];
  locale: string;
  canDelete?: boolean;
  keySelected?: string;
  module: string | null;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const TranslationTableComponent = (props: TranslationTableComponentProps) => {
  const {
    translations,
    keySelected,
    module,
    canDelete = true,
    onClickRow,
    onDelete,
  } = props;
  const { setItem, getItem } = useDatabase();
  const [filter, setFilter] = useState<string>(() => {
    return getItem('translation-filter') || '';
  });
  const [folderFilter, setFilterFolder] = useState<ShortcutsFolder[] | null>(
    null
  );
  const [filterModule, setFilterModule] = useState<boolean>(true);
  const [openIdShortcutsFolder, setOpenIdShortcutsFolder] = useState<
    string | null
  >(null);

  const formatData = useMemo(() => {
    let _translations = translations;
    if (filter !== '') {
      _translations = _translations.filter(
        (translation) =>
          translation.key.toLowerCase().includes(filter.toLowerCase()) ||
          translation.text.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (!filterModule) {
      _translations = _translations.filter(
        (predicate) => typeof predicate.module === 'undefined'
      );
    }
    if (module) {
      _translations = _translations.filter(
        (translation) => translation.module === module
      );
    }
    if (folderFilter && folderFilter.length > 0) {
      const allowedKeys = new Set(
        folderFilter
          .flatMap((f) => f.translations ?? [])
          .map((k) => k.toLowerCase()) // même casse que `translation.key`
      );

      _translations = _translations.filter((t) =>
        allowedKeys.has(t.key.toLowerCase())
      );
    }
    return Array.from(_translations).reverse();
  }, [filter, translations, filterModule, folderFilter]);

  const lengthTranslations = useMemo(
    () => Object.keys(formatData).length,
    [formatData]
  );

  useEffect(() => {
    setItem('translation-filter', filter);
  }, [filter]);

  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Grid.Column width={16}>
          <Input
            icon="search"
            placeholder="Search..."
            value={filter}
            fluid
            onChange={(_, { value }) =>
              setFilter(value.toLowerCase() as string)
            }
          />
        </Grid.Column>
        <Grid.Column width={10}>
          <DropdownShortcutsFoldersComponent onChange={setFilterFolder} />
        </Grid.Column>
        <Grid.Column width={6}>
          <Checkbox
            label={i18n.t('table_filter_module')}
            checked={filterModule}
            onClick={() => !module && setFilterModule(!filterModule)}
            disabled={!!module}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={16}>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formatData.map(({ key, text, deletable }) => (
                <Table.Row
                  key={key}
                  active={keySelected === key}
                  onClick={() => onClickRow(key)}
                >
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {key}
                      <Header.Subheader>{text}</Header.Subheader>
                    </Header>
                  </Table.Cell>
                  <Table.Cell textAlign="right" className="action">
                    <div>
                      <Button
                        basic
                        icon
                        color="teal"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenIdShortcutsFolder(key);
                        }}
                      >
                        <Icon name="folder" />
                      </Button>
                      <Button
                        basic
                        icon
                        color="red"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (deletable && canDelete) onDelete(key);
                        }}
                        disabled={!deletable || !canDelete}
                      >
                        <Icon name="trash" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  {i18n.t('module_table_count')}:&nbsp;
                  <b>{lengthTranslations}</b>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
      {openIdShortcutsFolder !== null && (
        <DialogShortcutsFoldersComponent
          id={openIdShortcutsFolder}
          typeTarget={'translations'}
          multiple
          onClose={() => {
            setOpenIdShortcutsFolder(null);
          }}
        />
      )}
    </Grid>
  );
};

export default TranslationTableComponent;
