import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import {
  ConstantFormComponent,
  ConstantHeaderComponent,
  ConstantTableComponent,
} from './components';
import useConstant from './useConstant';

const ConstantPage = () => {
  const {
    constants,
    stateForm,
    createConstant,
    sendCreateConstant,
    updateConstant,
    deleteConstant,
  } = useConstant();
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_constant')}</Header>
            </Grid.Row>
            <Grid.Row>
              <ConstantHeaderComponent onAppendConstant={createConstant} />
            </Grid.Row>
            <Grid.Row>
              <ConstantTableComponent
                constants={constants}
                onClickRow={updateConstant}
                onDelete={deleteConstant}
              />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && (
            <Grid.Column width={6}>
              <ConstantFormComponent
                defaultKey={stateForm.key}
                defaultValue={stateForm.value}
                onSubmit={sendCreateConstant}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ConstantPage;
