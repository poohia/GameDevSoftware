import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { Checkbox, Container, Grid } from 'semantic-ui-react';
import { ApplicationConfigJson } from 'types';

const HolidayOverlayParamsComponent: React.FC = () => {
  const [init, setInit] = useState<boolean>(false);
  const [christmas, setChristmas] = useState<boolean>(false);
  const [halloween, setHalloween] = useState<boolean>(false);

  const { requestMessage, sendMessage } = useEvents();
  useEffect(() => {
    requestMessage(
      'get-holidays-overlay',
      (holidaysOverlay: ApplicationConfigJson['holidaysOverlay']) => {
        setChristmas(holidaysOverlay.christmas);
        setHalloween(holidaysOverlay.halloween);
        setInit(true);
      }
    );
  }, []);

  useEffect(() => {
    if (init) {
      sendMessage('set-holidays-overlay', { christmas, halloween });
    }
  }, [christmas, halloween]);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <TransComponent
          id="module_application_params_holiday_overlay_title"
          className="game-dev-software-module-application-params-identity-segment-title"
        />

        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Checkbox
                label={
                  <label>
                    <TransComponent id="module_application_params_holiday_overlay_christmas_label" />
                  </label>
                }
                checked={christmas}
                onChange={(_e, data) => setChristmas(!!data.checked)}
              />
            </Grid.Column>
            <Grid.Column width={8}>
              <Checkbox
                label={
                  <label>
                    <TransComponent id="module_application_params_holiday_overlay_halloween_label" />
                  </label>
                }
                checked={halloween}
                onChange={(_e, data) => setHalloween(!!data.checked)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HolidayOverlayParamsComponent;
