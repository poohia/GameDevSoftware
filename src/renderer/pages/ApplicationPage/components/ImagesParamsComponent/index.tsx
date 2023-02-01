import { Container, Grid, Header, Icon } from 'semantic-ui-react';
import { Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import useImagesParamsComponent from './useImagesParamsComponent';

const ImagesParamsComponent = () => {
  const { imagesParams, replaceImage } = useImagesParamsComponent();
  console.log(
    '🚀 ~ file: index.tsx:8 ~ ImagesParamsComponent ~ imagesParams',
    imagesParams
  );
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {i18n.t('module_application_params_images_title')}
        </span>
        <Grid className="game-dev-software-module-application-params-images-container">
          <Grid.Row>
            <Grid.Column width={6}>
              <Header as="h3">
                <Icon name="chrome" />
                <Header.Content>Browser</Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={10}>
              <img
                onClick={() => replaceImage('favicon')}
                src={imagesParams?.favicon}
              />
              <p>Favicon 64x64 pixels</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={6}>
              <Header as="h3">
                <Icon name="apple" />
                <Header.Content>ios</Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={5}>
              <img
                onClick={() => replaceImage('icon')}
                src={imagesParams?.icon}
              />
              <p>Icon 1024x1024 pixels</p>
            </Grid.Column>
            <Grid.Column width={5}>
              <img
                onClick={() => replaceImage('splashscreen')}
                src={imagesParams?.splashscreen}
              />
              <p>Splashscreen 2732x2732 pixels</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <Header as="h3">
                <Icon name="android" />
                <Header.Content>Android</Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={3}>
              <img
                onClick={() => replaceImage('iconForegroundAndroid')}
                src={imagesParams?.iconForegroundAndroid}
              />
              <p>Icon Foreground 1024x1024 pixels</p>
            </Grid.Column>
            <Grid.Column width={3}>
              <img
                onClick={() => replaceImage('iconBackgroundAndroid')}
                src={imagesParams?.iconBackgroundAndroid}
              />
              <p>Icon Background 1024x1024 pixels</p>
            </Grid.Column>
            <Grid.Column width={6}>
              <img
                onClick={() => replaceImage('splashscreenAndroid')}
                src={imagesParams?.splashscreenAndroid}
              />
              <p>Splashscreen 512x512 pixels</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default ImagesParamsComponent;
