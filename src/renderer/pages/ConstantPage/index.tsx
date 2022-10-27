import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ConstantValue } from 'types';
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
    isModuleView,
    createConstant,
    sendCreateConstant,
    updateConstant,
    deleteConstant,
  } = useConstant();

  return (
    <Container fluid>
      <Grid divided columns={2}>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_constant')}</Header>
            </Grid.Row>
            {!isModuleView && (
              <Grid.Row>
                <ConstantHeaderComponent onClickAdd={createConstant} />
              </Grid.Row>
            )}
            <Grid.Row>
              <ConstantTableComponent
                constants={constants}
                keySelected={stateForm.key}
                canDelete={!isModuleView}
                onClickRow={updateConstant}
                onDelete={deleteConstant}
              />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && (
            <Grid.Column width={8}>
              <ConstantFormComponent
                defaultKey={stateForm.key}
                canEditeDescription={!isModuleView}
                defaultValue={stateForm.value as ConstantValue}
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
