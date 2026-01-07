import { useContext, useEffect, useMemo, useState } from 'react';
import { TransComponent } from 'renderer/components';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { useEvents } from 'renderer/hooks';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';
import { Segment } from 'renderer/semantic-ui';
import {
  Container,
  Dropdown,
  DropdownProps,
  Form,
  Grid,
} from 'semantic-ui-react';
import { MenusViewsType } from 'types';

const EndDemoPageConfig: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const { requestMessage, sendMessage } = useEvents();
  const { scenes } = useContext(ScenesContext);
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
                <TransComponent id="module_scene_home_title" />
              </label>
              <Dropdown
                fluid
                selection
                required
                options={options}
                onChange={() => {}}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default EndDemoPageConfig;
