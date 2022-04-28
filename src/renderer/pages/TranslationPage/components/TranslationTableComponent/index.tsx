import { useCallback, useState } from 'react';
import { Button, Grid, Header, Icon, Input, Table } from 'semantic-ui-react';
import { Translation } from 'types';

type TranslationTableComponentProps = {
  translations: Translation;
  locale: string;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const TranslationTableComponent = (props: TranslationTableComponentProps) => {
  const { translations, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const formatData = useCallback(() => {
    console.log(Object.keys(translations));
    if (filter !== '') {
      return Object.keys(translations).filter(
        (key) => key.includes(filter) || translations[key].includes(filter)
      );
    }
    return Object.keys(translations);
  }, [filter, translations]);
  return (
    <div className="game-dev-software-module-translation-table-values">
      <Grid.Row>
        <Input
          icon="search"
          placeholder="Search..."
          value={filter}
          onChange={(_, { value }) => setFilter(value as string)}
        />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={6}>
          <Table celled striped selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formatData().map((key) => (
                <Table.Row key={key} onClick={() => onClickRow(key)}>
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
                      onClick={() => onDelete(key)}
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </div>
  );
};

export default TranslationTableComponent;
