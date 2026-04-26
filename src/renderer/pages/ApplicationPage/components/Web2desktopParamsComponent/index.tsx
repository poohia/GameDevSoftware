import { Container, Form, Grid } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import useWeb2desktopParamsComponent from './useWeb2desktopParamsComponent';

const Web2desktopParamsComponent = () => {
  const { params, setParam, onSubmit } = useWeb2desktopParamsComponent();

  if (!params) {
    return <div>Loading....</div>;
  }

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          Web2Desktop
        </span>
        <Grid>
          <Form onSubmit={onSubmit}>
            <Form.Group widths="equal">
              <Form.Select
                label="themeSource"
                value={params.themeSource}
                options={[
                  { key: 'system', text: 'system', value: 'system' },
                  { key: 'dark', text: 'dark', value: 'dark' },
                  { key: 'light', text: 'light', value: 'light' },
                ]}
                onChange={(_, { value }) =>
                  setParam('themeSource', value as 'system' | 'dark' | 'light')
                }
                onBlur={onSubmit}
              />
              <Form.Checkbox
                label="resizable"
                checked={params.resizable}
                onChange={(_, { checked }) =>
                  setParam('resizable', Boolean(checked))
                }
                onBlur={onSubmit}
              />
              <Form.Checkbox
                label="closable"
                checked={params.closable}
                onChange={(_, { checked }) =>
                  setParam('closable', Boolean(checked))
                }
                onBlur={onSubmit}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                label="build.copyright"
                value={params.copyright}
                onChange={(_, { value }) => setParam('copyright', value)}
                onBlur={onSubmit}
              />
              <Form.Input
                label="plugins.Steam.appId"
                value={params.steamAppId ?? ''}
                type="number"
                onChange={(_, { value }) =>
                  setParam('steamAppId', value === '' ? null : Number(value))
                }
                onBlur={onSubmit}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                label="windows.signature.certificateFile"
                value={params.windowsCertificateFile}
                onChange={(_, { value }) =>
                  setParam('windowsCertificateFile', value)
                }
                onBlur={onSubmit}
              />
              <Form.Input
                label="windows.signature.certificatePassword"
                value={params.windowsCertificatePassword}
                onChange={(_, { value }) =>
                  setParam('windowsCertificatePassword', value)
                }
                onBlur={onSubmit}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                label="apple.signature.appleId"
                value={params.appleId}
                onChange={(_, { value }) => setParam('appleId', value)}
                onBlur={onSubmit}
              />
              <Form.Input
                label="apple.signature.appleIdPassword"
                value={params.appleIdPassword}
                onChange={(_, { value }) => setParam('appleIdPassword', value)}
                onBlur={onSubmit}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                label="apple.signature.identity"
                value={params.appleIdentity}
                onChange={(_, { value }) => setParam('appleIdentity', value)}
                onBlur={onSubmit}
              />
              <Form.Input
                label="apple.signature.teamId"
                value={params.appleTeamId}
                onChange={(_, { value }) => setParam('appleTeamId', value)}
                onBlur={onSubmit}
              />
            </Form.Group>
            <Button type="submit" />
          </Form>
        </Grid>
      </Segment>
    </Container>
  );
};

export default Web2desktopParamsComponent;
