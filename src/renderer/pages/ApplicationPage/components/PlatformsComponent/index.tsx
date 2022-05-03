import { Container, Grid, Header, Icon, Segment } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import PlatformsMobileComponentRow from '../PlatformsMobileComponentRow';
import usePlatformsComponent from './usePlatformsComponent';

const PlatformsComponent = () => {
  const { platforms } = usePlatformsComponent();
  if (!platforms) return <></>;
  const { android, ios, electron, browser } = platforms;
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {i18n.t('module_application_params_platforms_title')}
        </span>

        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="android" />
                    <Header.Content>Android</Header.Content>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <PlatformsMobileComponentRow
                  platform="android"
                  active={android}
                />
              </Grid.Row>
            </Grid.Column>
            <Grid.Column>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="ios" />
                    <Header.Content>ios</Header.Content>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <PlatformsMobileComponentRow platform="ios" active={ios} />
              </Grid.Row>
            </Grid.Column>
            <Grid.Column width={16}>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="windows" />
                    <Header.Content>Electron</Header.Content>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <PlatformsMobileComponentRow
                  platform="electron"
                  active={electron}
                />
              </Grid.Row>
            </Grid.Column>
            <Grid.Column width={16}>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="chrome" />
                    <Header.Content>Browser</Header.Content>
                  </Header>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <PlatformsMobileComponentRow
                  platform="browser"
                  active={browser}
                />
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default PlatformsComponent;
