import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Grid } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { TransComponent } from 'renderer/components';

const HomeCypressComponent = () => {
  const { sendMessage, on } = useEvents();
  const [loadingClear, setLoadingClear] = useState<boolean>(false);

  useEffect(() => {
    on('cypress-clear-screenshots', () => {
      setLoadingClear(false);
    });
  }, []);

  return (
    <Grid>
      <Grid.Row columns={2} width="equals">
        <Grid.Column>
          <Button onClick={() => sendMessage('open-cypress')}>
            <TransComponent id="module_application_home_cypress_open" />
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button onClick={() => sendMessage('open-cypress-screenshots')}>
            <TransComponent id="module_application_home_cypress_open_screenshots" />
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            disabled={loadingClear}
            onClick={() => {
              sendMessage('cypress-clear-screenshots');
              setLoadingClear(true);
            }}
            loading={loadingClear}
          >
            <TransComponent id="module_application_home_cypress_clear_screenshots" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default HomeCypressComponent;
