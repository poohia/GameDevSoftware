import { HomeGlobalModulesComponent } from 'renderer/pages/HomePage/components';
import { Container, Grid } from 'semantic-ui-react';
import { PageProps } from 'types';

const GameModuleHomePage = (props: PageProps) => {
  const { appendTab } = props;
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <HomeGlobalModulesComponent
              appendTab={appendTab}
              modules={['translation', 'constant', 'asset']}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default GameModuleHomePage;
