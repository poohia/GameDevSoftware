import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import {
  AssetTableComponent,
  AssetFormComponent,
  AssetHeaderComponent,
  AssetPreviewComponent,
} from './components';
import useAssetPage from './useAssetPage';

const AssetPage = () => {
  const { assets, stateForm, dispatch, saveFile, deleteFile } = useAssetPage();
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_asset')}</Header>
            </Grid.Row>
            <Grid.Row>
              <AssetHeaderComponent
                onClickAdd={() => dispatch({ type: 'show-create-form' })}
              />
            </Grid.Row>
            <Grid.Row>
              <AssetTableComponent
                assets={assets}
                onClickRow={(asset) => {
                  dispatch({
                    type: 'show-update-form',
                    data: {
                      key: asset.name,
                      value: asset,
                    },
                  });
                }}
                onDelete={deleteFile}
              />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && !stateForm.isEdit && (
            <Grid.Column width={8}>
              <AssetFormComponent onSubmit={saveFile} />
            </Grid.Column>
          )}
          {stateForm.show && stateForm.isEdit && (
            <Grid.Column width={8}>
              <AssetPreviewComponent asset={stateForm.value} />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetPage;
