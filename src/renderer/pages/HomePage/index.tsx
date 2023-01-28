import { Container, Grid } from 'semantic-ui-react';
import { PageProps } from 'types';
import { useCallback } from 'react';

/**  */
import { useDatabase } from 'renderer/hooks';
import {
  HomeProjectComponent,
  HomeGlobalModulesComponent,
  HomeGameModulesComponent,
} from './components';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  const { setItem } = useDatabase();
  const onChangeLocale = useCallback((locale: string) => {
    setItem('locale', locale);
    location.reload();
  }, []);
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <HomeProjectComponent appendTab={appendTab} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <HomeGlobalModulesComponent
            appendTab={appendTab}
            onChangeLocale={onChangeLocale}
          />
        </Grid.Row>
        <Grid.Row>
          <HomeGameModulesComponent appendTab={appendTab} />
        </Grid.Row>
      </Grid>
    </Container>
  );
};
export default HomePage;
