import { useCallback, useMemo, useState } from 'react';
import { Button, Grid, Header, Icon, Input, Table } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssetType } from 'types';

type AssetTableComponentProps = {
  assets: AssetType[];
  onClickRow: (name: string) => void;
  onDelete: (name: string) => void;
};
const AssetTableComponent = (props: AssetTableComponentProps) => {
  const { assets, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const formatData = useCallback(() => {
    // if (filter !== '') {
    //   return Object.keys(translations).filter(
    //     (key) => key.includes(filter) || translations[key].includes(filter)
    //   );
    // }
    // return Object.keys(translations);
    return assets;
  }, [filter, assets]);
  const lengthAssets = useMemo(() => assets.length, [assets]);
  return (
    <div className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Input
          icon="search"
          placeholder="Search..."
          //   value={filter}
          //   onChange={(_, { value }) => setFilter(value as string)}
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
              {formatData().map(({ name, type }) => (
                <Table.Row key={name} onClick={() => onClickRow(name)}>
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {name}
                      <Header.Subheader>{type}</Header.Subheader>
                    </Header>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(name);
                      }}
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
                  <b>{lengthAssets}</b>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </div>
  );
};

export default AssetTableComponent;
