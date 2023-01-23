import { useMemo, useState } from 'react';
import { Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { Translation } from 'types';

type TranslationTableComponentProps = {
  translations: Translation[];
  locale: string;
  keySelected?: string;
  module: string | null;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const TranslationTableComponent = (props: TranslationTableComponentProps) => {
  const { translations, keySelected, module, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const [filterModule, setFilterModule] = useState<boolean>(true);

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
    return _translations;
  }, [filter, translations, filterModule]);
  const lengthTranslations = useMemo(
    () => Object.keys(formatData).length,
    [formatData]
  );

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
        <Grid.Column width={16}>
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
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (deletable) onDelete(key);
                      }}
                      disabled={!deletable}
                    >
                      <Icon name="trash" />
                    </Button>
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
    </Grid>
  );
};

export default TranslationTableComponent;
