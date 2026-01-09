import { TransComponent } from 'renderer/components';
import { Container, Grid } from 'semantic-ui-react';
import HomePageConfig from './components/HomePageConfig';
import EndDemoPageConfig from './components/EndDemoPageConfig';
import CreditsPageConfig from './components/CreditsPageConfig';

const PagesModulePage: React.FC = () => {
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <h1>
              <TransComponent id="module_pages" />
            </h1>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <HomePageConfig />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <EndDemoPageConfig />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <CreditsPageConfig />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default PagesModulePage;
