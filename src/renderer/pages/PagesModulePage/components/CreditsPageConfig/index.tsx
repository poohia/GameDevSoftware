import { useCallback, useEffect, useRef, useState } from 'react';
import { TransComponent } from 'renderer/components';
import FormGenerator from 'renderer/components/FormGenerator';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { Container, Dropdown, DropdownProps, Grid } from 'semantic-ui-react';
import { MenusViewsType, PagesConfigType } from 'types';

const form = {
  blocks: {
    core: {
      title: 'translation',
      persons: {
        multiple: true,
        core: {
          title: 'translation',
          name: 'string',
        },
      },
    },
    multiple: true,
  },
};

const CreditsPageConfig: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const [defaultValues, setDefaultValues] = useState<
    PagesConfigType['creditsPath']['blocks'] | undefined
  >(undefined);
  const { requestMessage, sendMessage } = useEvents();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendData = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      sendMessage('set-page-credits-blocks', data.blocks);
    }, 1400);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    requestMessage('get-page-credits-config', (paths: MenusViewsType[]) => {
      setMenusViews(
        paths.map((path) => ({
          key: path.module,
          text: path.module,
          value: path.path,
          active: path.used,
        }))
      );
    });
  }, []);

  useEffect(() => {
    requestMessage('get-page-credits-blocks', (blocks: any) => {
      setDefaultValues({ blocks });
    });
  }, []);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment game-dev-software-module-application-params-pages-segment">
        <TransComponent
          id="module_pages_credits_config"
          className="game-dev-software-module-application-params-identity-segment-title"
        />

        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <label>
                <TransComponent id="module_application_params_home_view" />
              </label>
              <Dropdown
                fluid
                selection
                value={menusView?.find((m) => m.active)?.value}
                options={menusView}
                onChange={(_, { value }) => {
                  sendMessage('set-page-credits-config', value);
                }}
                required
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <FormGenerator
                form={form}
                defaultValues={defaultValues}
                onSubmit={handleSendData}
                onChange={handleSendData}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default CreditsPageConfig;
