import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssetTableComponent } from './components';
import useAssetPage from './useAssetPage';

const AssetPage = () => {
  const { assets } = useAssetPage();
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_asset')}</Header>
            </Grid.Row>
            <Grid.Row></Grid.Row>
            <Grid.Row>
              <AssetTableComponent assets={assets} />
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={6}>i'm here</Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetPage;
