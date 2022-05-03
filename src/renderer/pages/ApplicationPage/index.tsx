import { Container, Grid } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { IdentityParamsComponent, ImagesParamsComponent } from './components';

const ApplicationPage = () => {
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <h1>{i18n.t('module_application')}</h1>
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
      </Grid>
    </Container>
  );
};

export default ApplicationPage;
