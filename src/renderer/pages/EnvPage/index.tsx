import { Container, Grid, Header, Icon, Button } from 'semantic-ui-react';
import { TransComponent } from 'renderer/components';
import { EnvsFormComponent, EnvsTableComponent } from './components';
import useEnv from './useEnv';

const EnvPage: React.FC = () => {
  const {
    developmentEnvs,
    productionEnvs,
    stateForm,
    createEnv,
    updateEnv,
    deleteEnv,
    sendCreateEnv,
  } = useEnv();

  return (
    <Container fluid>
      <Grid divided columns={2}>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">
                <TransComponent id="module_env" />
              </Header>
            </Grid.Row>
            <Grid.Row>
              <Button
                icon
                color="green"
                labelPosition="right"
                onClick={createEnv}
              >
                <TransComponent id="module_env_append_var" />
                <Icon name="add" />
              </Button>
            </Grid.Row>
            <Grid.Row>
              <EnvsTableComponent
                developmentEnvs={developmentEnvs}
                productionEnvs={productionEnvs}
                onClickRow={updateEnv}
                onDelete={deleteEnv}
              />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && (
            <Grid.Column width={8}>
              <EnvsFormComponent
                defaultKey={stateForm.key}
                defaultValue={stateForm.value as string[]}
                onSubmit={sendCreateEnv}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default EnvPage;
