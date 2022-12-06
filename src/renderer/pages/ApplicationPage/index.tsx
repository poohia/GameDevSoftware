import { TransComponent } from 'renderer/components';
import { Container, Grid } from 'semantic-ui-react';
import {
  AdvancedParamsComponent,
  IdentityParamsComponent,
  ImagesParamsComponent,
  PlatformsComponent,
} from './components';

const ApplicationPage: React.FC = () => {
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <h1>
              <TransComponent id="module_application" />
            </h1>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <IdentityParamsComponent />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <ImagesParamsComponent />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <PlatformsComponent />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <AdvancedParamsComponent />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ApplicationPage;
