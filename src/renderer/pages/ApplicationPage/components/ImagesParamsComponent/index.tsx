import { Container, Grid, Segment } from 'semantic-ui-react';
import i18n from 'translations/i18n';

const ImagesParamsComponent = () => {
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {i18n.t('module_application_params_images_title')}
        </span>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <a
                target="_blank"
                href="https://github.com/ionic-team/capacitor-assets"
              >
                https://github.com/ionic-team/capacitor-assets
              </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default ImagesParamsComponent;
