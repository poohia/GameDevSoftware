import { Button, Grid, Header, Icon, Table } from 'semantic-ui-react';
import { Translation } from 'types';

type TranslationTableComponentProps = {
  translations: Translation;
  locale: string;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const TranslationTableComponent = (props: TranslationTableComponentProps) => {
  const { translations, onClickRow, onDelete } = props;
  return (
    <Grid.Row>
      <Grid.Column width={6}>
        <Table
          celled
          striped
          selectable
          className="game-dev-software-module-translation-table-values"
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.keys(translations).map((key) => (
              <Table.Row key={key} onClick={() => onClickRow(key)}>
                <Table.Cell width={16}>
                  <Header as="h3" textAlign="left">
                    {key}
                    <Header.Subheader>{translations[key]}</Header.Subheader>
                  </Header>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button basic icon color="red" onClick={() => onDelete(key)}>
                    <Icon name="trash" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Column>
    </Grid.Row>
  );
};

export default TranslationTableComponent;
