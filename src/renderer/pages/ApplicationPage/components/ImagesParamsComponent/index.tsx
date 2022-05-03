import { Container, Grid, Segment } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import useImagesParamsComponent from './useImagesParamsComponent';

const ImagesParamsComponent = () => {
  const { imagesParams, replaceImage } = useImagesParamsComponent();
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
          <Grid.Row
            width="equals"
            columns={3}
            className="game-dev-software-module-application-params-images-container"
          >
            <Grid.Column>
              <img
                onClick={() => replaceImage('favicon')}
                src={imagesParams?.favicon}
              />
              <p>Favicon 64x64 pixels</p>
            </Grid.Column>
            <Grid.Column>
              <img
                onClick={() => replaceImage('icon')}
                src={imagesParams?.icon}
              />
              <p>Icon 1024x1024 pixels</p>
            </Grid.Column>
            <Grid.Column>
              <img
                onClick={() => replaceImage('splashscreen')}
                src={imagesParams?.splashscreen}
              />
              <p>Splashscreen 2732x2732 pixels</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default ImagesParamsComponent;
