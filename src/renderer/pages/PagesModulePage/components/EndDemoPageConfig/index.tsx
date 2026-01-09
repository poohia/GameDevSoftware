import { useContext, useEffect, useMemo, useState } from 'react';
import { TransComponent } from 'renderer/components';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { Container, Dropdown, DropdownProps, Grid } from 'semantic-ui-react';
import { MenusViewsType } from 'types';

const EndDemoPageConfig: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const { requestMessage, sendMessage } = useEvents();
  const { scenes } = useContext(ScenesContext);
  const [sceneId, setSceneId] = useState<number | null>(null);
  const options = useMemo(
    () =>
      scenes.map((scene) => ({
        key: scene._id,
        text: `${scene._id} - ${scene._title}`,
        value: scene._id,
      })),
    [scenes]
  );

  useEffect(() => {
    requestMessage('get-page-enddemo-config', (paths: MenusViewsType[]) => {
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
    requestMessage('get-page-scene-before-demo-id', (s: number | null) => {
      setSceneId(s);
    });
  }, []);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <TransComponent
          id="module_pages_enddemo_config"
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
                  sendMessage('set-page-enddemo-config', value);
                }}
                required
              />
            </Grid.Column>
            <Grid.Column width={12}>
              <label>
                <TransComponent id="module_pages_config_scene_before_demo_id_label" />
              </label>
              <Dropdown
                fluid
                selection
                required
                clearable
                search
                options={options}
                value={sceneId || ''}
                onChange={(_, data) => {
                  sendMessage(
                    'set-page-scene-before-demo-id',
                    data.value || null
                  );
                }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default EndDemoPageConfig;
