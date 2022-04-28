import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ConstantTableComponent } from './components';
import useConstant from './useConstant';

const ConstantPage = () => {
  const { constants } = useConstant();
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_constant')}</Header>
            </Grid.Row>
            <Grid.Row>
              <ConstantTableComponent constants={constants} />
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={6}></Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ConstantPage;
