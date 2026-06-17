import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TransComponent } from 'renderer/components';
import AssetsContext from 'renderer/contexts/AssetsContext';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { useEvents } from 'renderer/hooks';
import { Button, Segment } from 'renderer/semantic-ui';
import {
  Container,
  Dropdown,
  DropdownProps,
  Form,
  Grid,
  Header,
  Icon,
} from 'semantic-ui-react';
import { MenusViewsType, PagesConfigType } from 'types';

type HomeByScene = NonNullable<PagesConfigType['homePath']['byScenes']>[number];

const createEmptyByScene = (): HomeByScene => ({
  scenes: [],
  music: '',
  backgroundImages: [],
});

const HomePageConfig: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const [byScenes, setByScenes] = useState<HomeByScene[]>([]);
  const { requestMessage, sendMessage } = useEvents();
  const { assets } = useContext(AssetsContext);
  const { scenes } = useContext(ScenesContext);

  const sceneOptions = useMemo(
    () =>
      scenes.map((scene) => ({
        key: scene._id,
        text: `${scene._id} - ${scene._title}`,
        value: `@s:${scene._id}`,
      })),
    [scenes]
  );

  const soundOptions = useMemo(
    () =>
      assets
        .filter((asset) => asset.type === 'sound')
        .map((asset) => ({
          key: asset.name,
          text: asset.name,
          value: `@a:${asset.name}`,
        })),
    [assets]
  );

  const imageOptions = useMemo(
    () =>
      assets
        .filter((asset) => asset.type === 'image')
        .map((asset) => ({
          key: asset.name,
          text: asset.name,
          value: `@a:${asset.name}`,
        })),
    [assets]
  );

  const setAndSaveByScenes = useCallback(
    (nextByScenes: HomeByScene[]) => {
      setByScenes(nextByScenes);
      sendMessage('set-page-home-by-scenes', nextByScenes);
    },
    [sendMessage]
  );

  const updateByScene = useCallback(
    (index: number, values: Partial<HomeByScene>) => {
      setAndSaveByScenes(
        byScenes.map((row, rowIndex) =>
          rowIndex === index ? { ...row, ...values } : row
        )
      );
    },
    [byScenes, setAndSaveByScenes]
  );

  const appendByScene = useCallback(() => {
    setAndSaveByScenes(byScenes.concat(createEmptyByScene()));
  }, [byScenes, setAndSaveByScenes]);

  const removeByScene = useCallback(
    (index: number) => {
      setAndSaveByScenes(byScenes.filter((_, rowIndex) => rowIndex !== index));
    },
    [byScenes, setAndSaveByScenes]
  );

  useEffect(() => {
    requestMessage('get-page-home-config', (paths: MenusViewsType[]) => {
      setMenusViews(
        paths.map((path) => ({
          key: path.module,
          text: path.module,
          value: path.path,
          active: path.used,
        }))
      );
    });
  }, []);

  useEffect(() => {
    requestMessage('get-page-home-by-scenes', (data: HomeByScene[]) => {
      setByScenes(Array.isArray(data) ? data : []);
    });
  }, []);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <TransComponent
          id="module_pages_home_config"
          className="game-dev-software-module-application-params-identity-segment-title"
        />

        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <label>
                <TransComponent id="module_application_params_home_view" />
              </label>
              <Dropdown
                fluid
                selection
                value={menusView?.find((m) => m.active)?.value}
                options={menusView}
                onChange={(_, { value }) => {
                  sendMessage('set-page-home-config', value);
                }}
                required
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <Header as="h3">
                <TransComponent id="module_pages_home_by_scenes_config" />
              </Header>
            </Grid.Column>
          </Grid.Row>
          {byScenes.map((row, index) => (
            <Grid.Row key={`home-by-scenes-${index}`}>
              <Grid.Column width={5}>
                <Form.Field>
                  <label>
                    <TransComponent id="module_pages_home_by_scenes_scenes" />
                  </label>
                  <Dropdown
                    fluid
                    multiple
                    selection
                    search
                    clearable
                    options={sceneOptions}
                    value={row.scenes}
                    onChange={(_, data) => {
                      updateByScene(index, {
                        scenes: data.value as string[],
                      });
                    }}
                  />
                </Form.Field>
              </Grid.Column>
              <Grid.Column width={5}>
                <Form.Field>
                  <label>
                    <TransComponent id="module_pages_home_by_scenes_music" />
                  </label>
                  <Dropdown
                    fluid
                    selection
                    search
                    clearable
                    options={soundOptions}
                    value={row.music}
                    onChange={(_, data) => {
                      updateByScene(index, {
                        music: (data.value as string) || '',
                      });
                    }}
                  />
                </Form.Field>
              </Grid.Column>
              <Grid.Column width={5}>
                <Form.Field>
                  <label>
                    <TransComponent id="module_pages_home_by_scenes_background_images" />
                  </label>
                  <Dropdown
                    fluid
                    multiple
                    selection
                    search
                    clearable
                    options={imageOptions}
                    value={row.backgroundImages}
                    onChange={(_, data) => {
                      updateByScene(index, {
                        backgroundImages: data.value as string[],
                      });
                    }}
                  />
                </Form.Field>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="bottom">
                <Button
                  basic
                  icon
                  color="red"
                  type="button"
                  onClick={() => removeByScene(index)}
                >
                  <Icon name="trash" />
                </Button>
              </Grid.Column>
            </Grid.Row>
          ))}
          <Grid.Row>
            <Grid.Column width={16}>
              <Button
                color="green"
                type="button"
                icon
                labelPosition="right"
                onClick={appendByScene}
              >
                <TransComponent id="form_button_add" />
                <Icon name="add" />
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HomePageConfig;
