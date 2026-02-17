import { useEffect, useState } from 'react';
import { Container, Grid, Header } from 'semantic-ui-react';
import { TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';

const ThemePage: React.FC = () => {
  const [theme, setTheme] = useState<any>(null);
  const { on, sendMessage } = useEvents();

  useEffect(() => {
    on('load-theme', (data) => {
      console.log('🚀 ~ ThemePage ~ data:', data);
      setTheme(data);
    });
    sendMessage('load-theme');
  }, [on, sendMessage]);

  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <Header as="h1">
              <TransComponent id="module_theme" />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <pre>{JSON.stringify(theme, null, 2)}</pre>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ThemePage;
