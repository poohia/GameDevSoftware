import { useCallback, useState } from 'react';
import { DropdownPlatformsComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Grid, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { PlatformsParams } from 'types';

const HomeBuildRowComponent = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { sendMessage, once } = useEvents();

  const sendPrepare = useCallback(() => {
    setLoading(true);
    sendMessage('build-platform');
    once('build-platform', () => {
      setLoading(false);
    });
  }, []);

  return (
    <Grid>
      <Grid.Row columns={1}>
        <Grid.Column width={10}>
          <Button
            color="purple"
            labelPosition="right"
            icon
            onClick={sendPrepare}
            loading={loading}
            fluid
          >
            {i18n.t('module_application_home_project_build')}
            <Icon name="plug" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default HomeBuildRowComponent;
