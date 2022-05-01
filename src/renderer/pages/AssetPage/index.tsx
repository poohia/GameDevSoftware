import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssetTableComponent } from './components';
import AssetFormComponent from './components/AssetFormComponent';
import AssetHeaderComponent from './components/AssetHeaderComponent';
import useAssetPage from './useAssetPage';

const AssetPage = () => {
  const { assets, stateForm, dispatch, saveFile, deleteFile } = useAssetPage();
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_asset')}</Header>
            </Grid.Row>
            <Grid.Row>
              <AssetHeaderComponent
                onClickAdd={() => dispatch({ type: 'show-create-form' })}
              />
            </Grid.Row>
            <Grid.Row>
              <AssetTableComponent assets={assets} onDelete={deleteFile} />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && (
            <Grid.Column width={6}>
              <AssetFormComponent onSubmit={saveFile} />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetPage;
