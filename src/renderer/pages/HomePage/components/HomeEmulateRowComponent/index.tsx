import { useState } from 'react';
import usePlatformsComponent from 'renderer/components/DropdownPlatformsComponent/usePlatformsComponent';
import { useEvents } from 'renderer/hooks';
import { Grid } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';

const HomeEmulateRowComponent = () => {
  const { platforms } = usePlatformsComponent();
  const { sendMessage } = useEvents();
  const [loadingSoftware, setLoadingSoftware] = useState<boolean>(false);
  const [loadingBrowser, setLoadingBrowser] = useState<boolean>(false);
  if (!platforms) return <></>;
  const { android, browser, electron, ios } = platforms;
  return (
    <Grid>
      <Grid.Row columns={2} width="equals">
        <Grid.Column>
          <Button
            disabled={!android}
            onClick={() => sendMessage('emulate-platform', 'android')}
          >
            Android
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            disabled={!ios}
            onClick={() => sendMessage('emulate-platform', 'ios')}
          >
            Ios
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            disabled={!browser}
            onClick={() => {
              sendMessage('emulate-platform', 'browser');
              setLoadingBrowser(!loadingBrowser);
            }}
            loading={loadingBrowser}
          >
            Browser
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            disabled={!electron}
            onClick={() => {
              sendMessage('emulate-platform', 'electron');
              setLoadingSoftware(!loadingSoftware);
            }}
            loading={loadingSoftware}
          >
            Software
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default HomeEmulateRowComponent;
