import { useMemo, useState } from 'react';
import { Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { Translation } from 'types';

type TranslationTableComponentProps = {
  translations: Translation;
  locale: string;
  keySelected?: string;
  canDelete: boolean;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const TranslationTableComponent = (props: TranslationTableComponentProps) => {
  const { translations, keySelected, canDelete, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const formatData = useMemo(() => {
    if (filter !== '') {
      return Object.keys(translations).filter(
        (key) =>
          key.toLowerCase().includes(filter.toLowerCase()) ||
          translations[key].toLowerCase().includes(filter.toLowerCase())
      );
    }
    return Object.keys(translations);
  }, [filter, translations]);
  const lengthTranslations = useMemo(
    () => Object.keys(formatData).length,
    [formatData]
  );

  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Grid.Column>
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
              {formatData.map((key) => (
                <Table.Row
                  key={key}
                  active={keySelected === key}
                  onClick={() => onClickRow(key)}
                >
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {key}
                      <Header.Subheader>{translations[key]}</Header.Subheader>
                    </Header>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (canDelete) onDelete(key);
                      }}
                      disabled={!canDelete}
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
