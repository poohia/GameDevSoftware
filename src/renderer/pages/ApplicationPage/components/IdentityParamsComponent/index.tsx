import { Container, Form, Grid } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import useIdentityParams from './useIdentityParam';
import { TransComponent } from 'renderer/components';

const IdentityParamsComponent = () => {
  const { params, setParam, onSubmit } = useIdentityParams();
  if (!params) {
    return <div>Loading....</div>;
  }
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <TransComponent
          id="module_application_params_identity_title"
          className="game-dev-software-module-application-params-identity-segment-title"
        />
        <Grid>
          <Form onSubmit={onSubmit}>
            <Form.Group widths="equal">
              {Object.keys(params).map(
                (key, i) =>
                  i < 4 && (
                    <Form.Field key={key}>
                      <label htmlFor={`identity-${key}`}>{key}</label>
                      <Form.Input
                        id={`identity-${key}`}
                        value={params[key]}
                        onChange={(_: any, { value }: any) =>
                          setParam(key, value)
                        }
                        onBlur={onSubmit}
                      />
                    </Form.Field>
                  )
              )}
            </Form.Group>
            <Form.Group widths="equal">
              {Object.keys(params).map(
                (key, i) =>
                  i > 3 &&
                  i < 7 && (
                    <Form.Field key={key}>
                      <label htmlFor={`identity-${key}`}>{key}</label>
                      <Form.Input
                        id={`identity-${key}`}
                        value={params[key]}
                        onChange={(_: any, { value }: any) =>
                          setParam(key, value)
                        }
                        onBlur={onSubmit}
                      />
                    </Form.Field>
                  )
              )}
            </Form.Group>
            <Form.Group widths="equal">
              {Object.keys(params).map(
                (key, i) =>
                  i > 7 && (
                    <Form.Field key={key}>
                      <label htmlFor={`identity-${key}`}>{key}</label>
                      <Form.Input
                        id={`identity-${key}`}
                        value={params[key]}
                        onChange={(_: any, { value }: any) =>
                          setParam(key, value)
                        }
                        onBlur={onSubmit}
                      />
                    </Form.Field>
                  )
              )}
            </Form.Group>
            <Button type="submit" />
          </Form>
        </Grid>
      </Segment>
    </Container>
  );
};

export default IdentityParamsComponent;
