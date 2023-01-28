import { Container, Grid, Header, Icon } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ButtonStartStopProjectComponent } from 'renderer/components';
import { HomeSoftwaresInfoComponent } from 'renderer/pages/HomePage/components';
import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import HomeBuildRowComponent from '../HomeBuildRowComponent';
import HomeEmulateRowComponent from '../HomeEmulateRowComponent';
import { PageProps } from 'types';
import { modulesComponent } from 'renderer/App';

type HomeProjectComponentProps = Required<Pick<PageProps, 'appendTab'>>;

const HomeProjectComponent: React.FC<HomeProjectComponentProps> = ({
  appendTab,
}) => {
  const [pathProject, setPathProject] = useState<string>('');
  const { sendMessage } = useEvents();

  useEffect(() => {
    setPathProject((_pathProject) => {
      return localStorage.getItem('last-path') || '';
    });
  }, []);

  return (
    <Container className="game-dev-software-module-home-project-segment">
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {i18n.t('module_application_home_project_title')}
        </span>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Grid.Row>
                <Grid.Column>{pathProject}</Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Button
                  color="teal"
                  labelPosition="right"
                  icon
                  onClick={() => sendMessage('select-path')}
                >
                  {i18n.t('module_application_home_project_open_new_project')}
                  <Icon name="folder open" />
                </Button>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <ButtonStartStopProjectComponent
                    onClickUrl={() => {
                      appendTab(`module_view`, modulesComponent[`ViewPage`]);
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">
                    {i18n.t('module_application_home_project_build')}
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <HomeBuildRowComponent />
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Emulate</Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <HomeEmulateRowComponent />
              </Grid.Row>
            </Grid.Column>
            <Grid.Column>
              <HomeSoftwaresInfoComponent />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HomeProjectComponent;
