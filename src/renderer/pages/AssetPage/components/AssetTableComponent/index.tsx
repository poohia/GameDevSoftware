import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DialogShortcutsFoldersComponent,
  DropdownAssetTypesComponent,
  DropdownShortcutsFoldersComponent,
} from 'renderer/components';
import { Checkbox, Grid, Header, Icon, Input, Popup } from 'semantic-ui-react';
import { Button, Segment, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssertAcceptedType, AssetType, ShortcutsFolder } from 'types';
import { useDatabase, useEvents } from 'renderer/hooks';
import { formatBase64 } from 'utils';

type AssetTableComponentProps = {
  assets: AssetType[];
  keySelected?: string;
  defaultFilterType?: AssertAcceptedType;
  showSelectedValue?: boolean;
  module: string | null;
  onClickRow: (name: AssetType) => void;
  onDelete: (name: string) => void;
};

const AssetTableHeaderCellContent = (props: { asset: AssetType }) => {
  const { asset } = props;
  const { name, type } = asset;
  const { once, sendMessage } = useEvents();
  const [base64, setBase64] = useState<string>();
  const [loading, setLoading] = useState(false);

  const loadPreview = useCallback(() => {
    if (type !== 'image' || base64 || loading) return;
    setLoading(true);
    once('get-asset-information', (arg: string) => {
      setBase64(formatBase64(type, arg, name));
      setLoading(false);
    });
    sendMessage('get-asset-information', asset);
  }, [asset, base64, loading, name, once, sendMessage, type]);

  const header = (
    <div onMouseEnter={loadPreview}>
      <Header as="h3" textAlign="left">
        {name}
        <Header.Subheader>{type}</Header.Subheader>
      </Header>
    </div>
  );

  if (type !== 'image') {
    return header;
  }

  return (
    <Popup
      hoverable
      mouseEnterDelay={400}
      trigger={header}
      content={
        <div style={{ minWidth: 180, textAlign: 'center' }}>
          {base64 ? (
            <img
              src={base64}
              alt={name}
              style={{
                display: 'block',
                maxHeight: 220,
                maxWidth: 260,
                objectFit: 'contain',
              }}
            />
          ) : (
            <span>{loading ? 'Loading...' : name}</span>
          )}
        </div>
      }
    />
  );
};

const AssetTableComponent = (props: AssetTableComponentProps) => {
  const {
    assets,
    keySelected,
    defaultFilterType,
    showSelectedValue = false,
    module,
    onClickRow,
    onDelete,
  } = props;
  const { setItem, getItem } = useDatabase();
  const [filter, setFilter] = useState<string>(() => {
    return getItem('asset-filter') || '';
  });
  const [filterType, setFilterType] = useState<AssertAcceptedType | string>(
    defaultFilterType || ''
  );
  const [folderFilter, setFilterFolder] = useState<ShortcutsFolder[] | null>(
    null
  );
  const [filterModule, setFilterModule] = useState<boolean>(true);
  const [openIdShortcutsFolder, setOpenIdShortcutsFolder] = useState<
    string | null
  >(null);
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
    // if (folderFilter) {
    //   _assets = _assets.filter((asset) =>
    //     folderFilter.assets && folderFilter.assets.length > 0
    //       ? folderFilter.assets.includes(asset.name)
    //       : false
    //   );
    // }
    if (folderFilter && folderFilter.length > 0) {
      // on agrège toutes les listes assets[] des dossiers sélectionnés
      const allowedNames = new Set(folderFilter.flatMap((f) => f.assets ?? []));

      _assets = _assets.filter((asset) => allowedNames.has(asset.name));
    }

    return _assets;
  }, [filter, filterType, filterModule, assets, module, folderFilter]);
  const assetsToShow = useMemo(
    () => Array.from(formatData()).reverse(),
    [formatData]
  );
  const lengthAssets = useMemo(() => assetsToShow.length, [assetsToShow]);
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.name === keySelected),
    [assets, keySelected]
  );

  useEffect(() => {
    setItem('asset-filter', filter);
  }, [filter]);

  return (
    <Grid className="game-dev-software-table-component">
      {showSelectedValue && keySelected && (
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h4">
              {i18n.t('form_input_modal_default_value_label')}
            </Header>
            <Segment>
              <strong>@a:{keySelected}</strong>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      )}
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
              {assetsToShow.map(
                ({ name, type, module, editable, deletable, ...rest }) => (
                  <Table.Row
                    key={name}
                    onClick={() =>
                      onClickRow({
                        name,
                        type,
                        module,
                        editable,
                        deletable,
                        ...rest,
                      })
                    }
                    active={keySelected === name}
                  >
                    <Table.Cell width={16}>
                      <AssetTableHeaderCellContent
                        asset={{
                          name,
                          type,
                          module,
                          editable,
                          deletable,
                          ...rest,
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="right" className="action">
                      <div>
                        <Button
                          basic
                          icon
                          color="teal"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenIdShortcutsFolder(name);
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
                            deletable && onDelete(name);
                          }}
                          disabled={!deletable}
                        >
                          <Icon name="trash" />
                        </Button>
                      </div>
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
      {openIdShortcutsFolder !== null && (
        <DialogShortcutsFoldersComponent
          id={openIdShortcutsFolder}
          typeTarget={'assets'}
          multiple
          onClose={() => {
            setOpenIdShortcutsFolder(null);
          }}
        />
      )}
    </Grid>
  );
};

export default AssetTableComponent;
