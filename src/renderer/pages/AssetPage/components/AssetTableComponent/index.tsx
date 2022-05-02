import { useCallback, useMemo, useState } from 'react';
import { DropdownAssetTypesComponent } from 'renderer/components';
import { Button, Grid, Header, Icon, Input, Table } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssertAcceptedType, AssetType } from 'types';

type AssetTableComponentProps = {
  assets: AssetType[];
  onClickRow: (name: AssetType) => void;
  onDelete: (name: string) => void;
};
const AssetTableComponent = (props: AssetTableComponentProps) => {
  const { assets, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const [filterType, setFilterType] = useState<AssertAcceptedType | string>('');
  const formatData = useCallback(() => {
    let _assets = assets;
    if (filter !== '') {
      _assets = _assets.filter((asset) => asset.name.includes(filter));
    }
    if (filterType !== '') {
      _assets = _assets.filter((asset) => asset.type === filterType);
    }
    return _assets;
  }, [filter, , filterType, assets]);
  const assetsToShow = useMemo(() => formatData(), [formatData]);
  const lengthAssets = useMemo(() => assetsToShow.length, [assetsToShow]);
  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row
        className="game-dev-software-table-component-search"
        columns={2}
      >
        <Grid.Column>
          <Input
            icon="search"
            placeholder="Search..."
            value={filter}
            fluid
            onChange={(_, { value }) => setFilter(value as string)}
          />
        </Grid.Column>
        <Grid.Column width={6}>
          <DropdownAssetTypesComponent
            placeholder="File type"
            onChange={(_: any, data: any) => setFilterType(data.value)}
            clearable
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={16}>
          <Table celled striped selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {assetsToShow.map(({ name, type }) => (
                <Table.Row
                  key={name}
                  onClick={() => onClickRow({ name, type })}
                >
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
    </Grid>
  );
};

export default AssetTableComponent;
