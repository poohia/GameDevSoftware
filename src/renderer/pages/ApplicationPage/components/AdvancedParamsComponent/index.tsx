import { useEffect, useMemo, useState } from 'react';
import { DropDownFontsComponent, TransComponent } from 'renderer/components';
import { AssetInput } from 'renderer/components/FormGenerator/components';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { Container, Dropdown, DropdownProps, Grid } from 'semantic-ui-react';
import { MenusViewsType } from 'types';

const AdvancedParamsComponent: React.FC = () => {
  const [menusView, setMenusViews] = useState<DropdownProps['options']>([]);
  const [valueScreenOrientation, setValueScreenOrientation] = useState<
    string | undefined
  >();
  const [fontFamilyValue, setFontFamilyValue] = useState<string | undefined>(
    undefined
  );
  const [backgroundValue, setBackgroundValue] = useState<string | undefined>(
    undefined
  );
  const { requestMessage, sendMessage } = useEvents();

  const orientations = useMemo(
    (): DropdownProps['options'] => [
      {
        text: 'Any',
        value: 'any',
        key: 'any',
      },
      {
        text: 'Landscape',
        value: 'landscape',
        key: 'landscape',
      },
      {
        text: 'Portrait',
        value: 'portrait',
        key: 'portrait',
      },
      {
        text: 'Landscape Primary',
        value: 'landscape-primary',
        key: 'landscape-primary',
      },
      {
        text: 'Landscape-Secondary',
        value: 'landscape-secondary',
        key: 'landscape-secondary',
      },
      {
        text: 'Portrait Primary',
        value: 'portrait-primary',
        key: 'portrait-primary',
      },
      {
        text: 'Portrait Secondary',
        value: 'portrait-secondary',
        key: 'portrait-secondary',
      },
    ],
    []
  );

  useEffect(() => {
    requestMessage('load-menus-views', (paths: MenusViewsType[]) => {
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
    requestMessage('load-current-orientation', (orientation: string) => {
      setValueScreenOrientation(orientation);
    });
  });

  useEffect(() => {
    requestMessage('load-fontFamily', (fontFamily: string) => {
      setFontFamilyValue(fontFamily);
    });
  });

  useEffect(() => {
    requestMessage('load-background', (fontFamily: string) => {
      setBackgroundValue(fontFamily);
    });
  });

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <TransComponent
          id="module_application_params_advanced_title"
          className="game-dev-software-module-application-params-identity-segment-title"
        />

        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <label>
                <TransComponent id="module_application_params_orientation_title" />
              </label>
              <Dropdown
                fluid
                selection
                value={valueScreenOrientation}
                options={orientations}
                onChange={(_, { value }) => {
                  sendMessage('set-current-orientation', value);
                }}
                required
              />
            </Grid.Column>
            <Grid.Column width={8}>
              <label>
                <TransComponent id="module_application_params_background" />
              </label>
              <AssetInput
                type={'image'}
                name="background"
                defaultValue={backgroundValue}
                onChange={(value) => {
                  sendMessage('set-background', value.target.value);
                }}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={8}>
              <label>
                <TransComponent id="module_application_params_fontFamily" />
              </label>
              <DropDownFontsComponent
                value={fontFamilyValue}
                onChange={(_, data) => {
                  if (!!data?.value) {
                    sendMessage('set-fontFamily', data.value);
                  }
                }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default AdvancedParamsComponent;
