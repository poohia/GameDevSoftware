import { useCallback, useMemo, useState } from 'react';
import { DropdownAssetTypesComponent } from 'renderer/components';
import { Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssertAcceptedType, AssetType } from 'types';

type AssetTableComponentProps = {
  assets: AssetType[];
  keySelected?: string;
  defaultFilterType?: AssertAcceptedType;
  module: string | null;
  onClickRow: (name: AssetType) => void;
  onDelete: (name: string) => void;
};
const AssetTableComponent = (props: AssetTableComponentProps) => {
  const {
    assets,
    keySelected,
    defaultFilterType,
    module,
    onClickRow,
    onDelete,
  } = props;
  const [filter, setFilter] = useState<string>('');
  const [filterType, setFilterType] = useState<AssertAcceptedType | string>(
    defaultFilterType || ''
  );
  const [filterModule, setFilterModule] = useState<boolean>(true);
  const formatData = useCallback(() => {
    let _assets = assets.map((asset) => ({
      ...asset,
      name: asset.name,
    }));
    if (filter !== '') {
      _assets = _assets.filter((asset) =>
        asset.name.toLowerCase().includes(filter)
      );
    }
    if (filterType !== '') {
      _assets = _assets.filter((asset) => asset.type === filterType);
    }
    if (!filterModule) {
      _assets = _assets.filter(
        (predicate) => typeof predicate.module === 'undefined'
      );
    }
    if (module) {
      _assets = _assets.filter((asset) => asset.module === module);
    }
    return _assets;
  }, [filter, filterType, filterModule, assets, module]);
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
            onChange={(_, { value }) =>
              setFilter(value.toLocaleLowerCase() as string)
            }
          />
        </Grid.Column>
        <Grid.Column width={6}>
          <DropdownAssetTypesComponent
            placeholder="File type"
            onChange={(_: any, data: any) => setFilterType(data.value)}
            clearable
            disabled={!!defaultFilterType}
            defaultValue={defaultFilterType}
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
              {assetsToShow.map(
                ({ name, type, module, editable, deletable }) => (
                  <Table.Row
                    key={name}
                    onClick={() =>
                      onClickRow({ name, type, module, editable, deletable })
                    }
                    active={keySelected === name}
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
                          deletable && onDelete(name);
                        }}
                        disabled={!deletable}
                      >
                        <Icon name="trash" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              )}
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
