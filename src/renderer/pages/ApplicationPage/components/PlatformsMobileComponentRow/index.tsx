import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Container, Grid, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';

const PlatformsMobileComponentRow = (props: {
  platform: string;
  active: boolean;
}) => {
  const { platform, active } = props;
  const { sendMessage } = useEvents();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => setLoading(false), [props]);

  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {active && (
              <Button
                icon
                labelPosition="right"
                color="red"
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  sendMessage('remove-platform', platform);
                }}
              >
                {i18n.t('module_application_params_platforms_remove')}
                <Icon name="close" />
              </Button>
            )}
            {!active && (
              <Button
                icon
                labelPosition="right"
                color="green"
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  sendMessage('add-platform', platform);
                }}
              >
                {i18n.t('module_application_params_platforms_append')}
                <Icon name="add" />
              </Button>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default PlatformsMobileComponentRow;
