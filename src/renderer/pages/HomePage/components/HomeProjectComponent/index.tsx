import { ButtonStartStopProject } from 'renderer/components';
import { Container, Grid, Segment } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { HomeSoftwaresInfoComponent } from 'renderer/pages/HomePage/components';

const HomeProjectComponent = () => {
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {i18n.t('module_application_home_project_title')}
        </span>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <ButtonStartStopProject />
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
