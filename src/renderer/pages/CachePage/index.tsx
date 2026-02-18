import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TransComponent } from 'renderer/components';
import AssetsContext from 'renderer/contexts/AssetsContext';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { useEvents } from 'renderer/hooks';
import { Button, Table } from 'renderer/semantic-ui';
import { CacheItem } from 'types';
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

  const sceneOptions = useMemo(
    () =>
      scenes
        .map((scene) => ({
          key: scene._id,
          text: `${scene._id} - ${scene._title}`,
          value: scene._id,
        }))
        .sort((a, b) => Number(a.value) - Number(b.value)),
    [scenes]
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
      sceneOptions.reduce<Record<number, string>>((acc, option) => {
        acc[option.value as number] = option.text as string;
        return acc;
      }, {}),
    [sceneOptions]
  );

  const assetOptions = useMemo(() => {
    const namesFromContexts = assets.map((asset) => asset.name);
    const namesFromCaches = caches.flatMap((cache) => cache.assets || []);
    const allAssetNames = Array.from(
      new Set([...namesFromContexts, ...namesFromCaches, ...newAssets])
    );
    return allAssetNames.map((name) => ({
      key: name,
      text: name,
      value: name,
    }));
  }, [assets, caches, newAssets]);

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
    if (!selectedSceneIds.has(newSceneId)) return;
    setNewSceneId(null);
  }, [newSceneId, selectedSceneIds]);

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
                        onChange={(_e, data) =>
                          setNewSceneId((data.value as number) || 0)
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
                        options={assetOptions}
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
                        {sceneLabelMap[item.sceneId] || item.sceneId}
                      </Table.Cell>
                      <Table.Cell>
                        <Dropdown
                          fluid
                          selection
                          search
                          multiple
                          clearable
                          options={assetOptions}
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
