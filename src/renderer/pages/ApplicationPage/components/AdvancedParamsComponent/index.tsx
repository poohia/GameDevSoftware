import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { Container, Dropdown, DropdownProps, Grid } from 'semantic-ui-react';
import { MenusViewsType } from 'types';

const AdvancedParamsComponent: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const { requestMessage, sendMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-menus-views', (paths: MenusViewsType[]) => {
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
          id="module_application_params_advanced_title"
          className="game-dev-software-module-application-params-identity-segment-title"
        />

        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <label>
                <TransComponent id="module_application_params_home_view" />
              </label>
              <Dropdown
                fluid
                selection
                value={menusView?.find((m) => m.active)?.value}
                options={menusView}
                onChange={(_, { value }) => {
                  sendMessage('set-menu-view', value);
                }}
                required
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default AdvancedParamsComponent;
