import { Container, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import useImagesParamsComponent from './useImagesParamsComponent';

const ImagesParamsComponent = () => {
  const {
    imagesParams,
    splashscreenInformation,
    replaceImage,
    modifySlogan,
    updateSlogan,
    replaceBrandImage,
    replacePromotionVideo,
  } = useImagesParamsComponent();

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
            <Grid.Column width={6}>
              <img
                onClick={() => replaceImage('icon')}
                src={imagesParams?.icon}
                style={{ width: '100%' }}
              />
              <p>Icon 1024x1024 pixels</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <Header as="h3">
                <Icon name="android" />
                <Header.Content>Android</Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={4}>
              <img
                onClick={() => replaceImage('iconForegroundAndroid')}
                src={imagesParams?.iconForegroundAndroid}
              />
              <p>Icon Foreground 432×432 pixels</p>
            </Grid.Column>
            <Grid.Column width={4}>
              <img
                onClick={() => replaceImage('iconBackgroundAndroid')}
                src={imagesParams?.iconBackgroundAndroid}
              />
              <p>Icon Background 432×432 pixels</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <Header as="h3">
                <Icon name="image outline" />
                <Header.Content>Splashscreen</Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={4}>
              <img
                onClick={replaceBrandImage}
                src={splashscreenInformation?.brandImage}
              />
              <p>Brand Image 128x128 pixels</p>
            </Grid.Column>
            <Grid.Column width={4}>
              <video
                onClick={replacePromotionVideo}
                src={splashscreenInformation?.gamePromotionVideo}
                autoPlay
                loop
                width="100%"
                height="100%"
              />
              <p>Video promotion mp4</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}></Grid.Column>
            <Grid.Column width={6}>
              <Input
                label="Slogan"
                labelPosition="right"
                fluid
                value={splashscreenInformation?.brandSlogan}
                onChange={(_, { value }) => modifySlogan(value)}
                onBlur={updateSlogan}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default ImagesParamsComponent;
