import { useCallback, useState } from 'react';
import { DropdownPlatformsComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Button, Grid, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { PlatformsParams } from 'types';

const HomeBuildRowComponent = () => {
  const [platform, setPlatform] = useState<keyof PlatformsParams | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { sendMessage, once } = useEvents();

  const sendBuild = useCallback(() => {
    setLoading(true);
    sendMessage('build-platform');
    once('build-platform', () => {
      setLoading(false);
    });
  }, [platform]);

  return (
    <Grid>
      <Grid.Row columns={2} width={'equals'}>
        <Grid.Column>
          <DropdownPlatformsComponent
            onChange={(
              _: any,
              { value }: { value: keyof PlatformsParams | '' }
            ) => {
              if (value === '') {
                setPlatform(null);
              } else {
                setPlatform(value);
              }
            }}
          />
        </Grid.Column>
        <Grid.Column>
          <Button
            color="purple"
            labelPosition="right"
            icon
            disabled={!platform}
            onClick={sendBuild}
            loading={loading}
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
