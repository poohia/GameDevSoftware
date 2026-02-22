import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DropdownShortcutsFoldersComponent,
  TransComponent,
} from 'renderer/components';
import AssetsContext from 'renderer/contexts/AssetsContext';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { useEvents } from 'renderer/hooks';
import { Button, Table } from 'renderer/semantic-ui';
import { CacheItem, ShortcutsFolder } from 'types';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
} from 'semantic-ui-react';
import i18n from 'translations/i18n';

const CachePage: React.FC = () => {
  const [caches, setCaches] = useState<CacheItem[]>([]);
  const [newSceneId, setNewSceneId] = useState<number | null>(null);
  const [newAssets, setNewAssets] = useState<string[]>([]);
  const [folderFilter, setFilterFolder] = useState<ShortcutsFolder[] | null>(
    null
  );
  const hasLoadedRef = useRef(false);
  const { on, sendMessage } = useEvents();
  const { assets } = useContext(AssetsContext);
  const { scenes } = useContext(ScenesContext);

  useEffect(() => {
    const unsubscribe = on('load-cache', (data: CacheItem[]) => {
      const nextCaches = Array.isArray(data) ? data : [];
      setCaches((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(nextCaches)) {
          return prev;
        }
        return nextCaches;
      });
      hasLoadedRef.current = true;
    });

    sendMessage('load-cache');
    return unsubscribe;
  }, [on, sendMessage]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    sendMessage('set-cache', caches);
  }, [caches, sendMessage]);

  const allowedSceneIds = useMemo(
    () => new Set(folderFilter?.flatMap((folder) => folder.scenes ?? []) || []),
    [folderFilter]
  );
  const allowedAssets = useMemo(
    () => new Set(folderFilter?.flatMap((folder) => folder.assets ?? []) || []),
    [folderFilter]
  );

  const sceneOptions = useMemo(
    () =>
      scenes
        .filter((scene) => {
          if (!folderFilter || folderFilter.length === 0) return true;
          return allowedSceneIds.has(scene._id);
        })
        .map((scene) => ({
          key: scene._id,
          text: `${scene._id} - ${scene._title}`,
          value: scene._id,
        }))
        .sort((a, b) => Number(a.value) - Number(b.value)),
    [allowedSceneIds, folderFilter, scenes]
  );
  const selectedSceneIds = useMemo(
    () => new Set(caches.map((cache) => cache.sceneId)),
    [caches]
  );
  const availableSceneOptions = useMemo(
    () =>
      sceneOptions.filter(
        (option) => !selectedSceneIds.has(option.value as number)
      ),
    [sceneOptions, selectedSceneIds]
  );
  const sceneLabelMap = useMemo(
    () =>
      scenes.reduce<Record<number, string>>((acc, scene) => {
        acc[scene._id] = `${scene._id} - ${scene._title}`;
        return acc;
      }, {}),
    [scenes]
  );
  const getSceneDisplayLabel = useCallback(
    (sceneId: number) => {
      if (sceneId === -1) return 'Splashscreen';
      return sceneLabelMap[sceneId] || `${sceneId}`;
    },
    [sceneLabelMap]
  );

  const baseAssetOptions = useMemo(() => {
    const filteredAssets = assets
      .filter((asset) => asset.type === 'image')
      .map((asset) => asset.name)
      .filter((assetName) => {
        if (!folderFilter || folderFilter.length === 0) return true;
        return allowedAssets.has(assetName);
      });
    return Array.from(new Set(filteredAssets)).map((name) => ({
      key: name,
      text: name,
      value: name,
    }));
  }, [allowedAssets, assets, folderFilter]);

  const buildAssetOptions = useCallback(
    (currentValues: string[] = []) => {
      const optionNames = Array.from(
        new Set([
          ...baseAssetOptions.map((option) => option.value as string),
          ...currentValues,
        ])
      );
      return optionNames.map((name) => ({
        key: name,
        text: name,
        value: name,
      }));
    },
    [baseAssetOptions]
  );

  const addRow = useCallback(() => {
    if (availableSceneOptions.length === 0 && newSceneId === null) return;
    const fallbackSceneId =
      newSceneId !== null
        ? newSceneId
        : availableSceneOptions.length > 0
        ? (availableSceneOptions[0].value as number)
        : 0;
    if (selectedSceneIds.has(fallbackSceneId)) return;
    setCaches((prev) =>
      prev.concat([{ sceneId: fallbackSceneId, assets: newAssets }])
    );
    setNewSceneId(null);
    setNewAssets([]);
  }, [availableSceneOptions, newAssets, newSceneId, selectedSceneIds]);

  const updateAssets = useCallback((index: number, values: string[]) => {
    setCaches((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          assets: values,
        };
      })
    );
  }, []);

  const deleteRow = useCallback((index: number) => {
    setCaches((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  useEffect(() => {
    if (newSceneId === null) return;
    const existsInFilteredOptions = availableSceneOptions.some(
      (option) => option.value === newSceneId
    );
    if (existsInFilteredOptions && !selectedSceneIds.has(newSceneId)) return;
    setNewSceneId(null);
  }, [availableSceneOptions, newSceneId, selectedSceneIds]);

  return (
    <Container style={{ width: '60%', maxWidth: 1600 }}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <Header as="h1">
              <TransComponent id="module_cache" />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <br /> <br /> <br /> <br />
        <Grid.Row className="game-dev-software-table-component-search">
          <Grid.Column width={8}>
            <DropdownShortcutsFoldersComponent onChange={setFilterFolder} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Form>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={4}>
                      <TransComponent id="module_cache_scene_id" />
                    </Table.HeaderCell>
                    <Table.HeaderCell width={10}>
                      <TransComponent id="module_cache_assets" />
                    </Table.HeaderCell>
                    <Table.HeaderCell width={2} textAlign="center">
                      <TransComponent id="module_cache_add_row" />
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      <Dropdown
                        fluid
                        selection
                        search
                        placeholder={i18n.t('module_cache_select_scene')}
                        options={availableSceneOptions}
                        value={newSceneId ?? undefined}
                        clearable
                        onChange={(_e, data) =>
                          setNewSceneId((data.value as number) || null)
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Dropdown
                        fluid
                        selection
                        search
                        multiple
                        clearable
                        placeholder={i18n.t('module_cache_select_assets')}
                        options={buildAssetOptions(newAssets)}
                        value={newAssets}
                        onChange={(_e, data) =>
                          setNewAssets((data.value as string[]) || [])
                        }
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        icon
                        color="teal"
                        onClick={addRow}
                        disabled={availableSceneOptions.length === 0}
                      >
                        <Icon name="add" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>

                  {caches.map((item, index) => (
                    <Table.Row key={`${item.sceneId}-${index}`}>
                      <Table.Cell>
                        {getSceneDisplayLabel(item.sceneId)}
                      </Table.Cell>
                      <Table.Cell>
                        <Dropdown
                          fluid
                          selection
                          search
                          multiple
                          clearable
                          options={buildAssetOptions(item.assets || [])}
                          value={item.assets || []}
                          onChange={(_e, data) =>
                            updateAssets(index, (data.value as string[]) || [])
                          }
                        />
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Button
                          color="red"
                          icon
                          onClick={() => deleteRow(index)}
                          disabled={item.sceneId === -1}
                        >
                          <Icon name="trash" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}

                  {caches.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan="3" textAlign="center">
                        <TransComponent id="module_cache_empty" />
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default CachePage;
