import { useCallback, useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import i18n from 'translations/i18n';
import { Container, Form, Grid, Header } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';

type EnvsFormComponentProps = {
  defaultKey: string;
  defaultValue?: string[];
  onSubmit: (
    key: string,
    valueDevelopment: string,
    valueProduction: string
  ) => void;
};

const EnvsFormComponent: React.FC<EnvsFormComponentProps> = (props) => {
  const { defaultKey, defaultValue, onSubmit } = props;

  const [key, setKey] = useState<string>(defaultKey);
  const [valueDevelopment, setValueDevelopment] = useState<string>('');
  const [valueProduction, setValueProduction] = useState<string>('');

  const handleChangeKey = useCallback((value: string) => {
    setKey(value.toUpperCase().replace(' ', '_'));
  }, []);

  useEffect(() => {
    if (defaultKey) {
      setKey(defaultKey);
    } else {
      setKey('');
    }
    if (defaultValue) {
      setValueDevelopment(defaultValue[0]);
      setValueProduction(defaultValue[1]);
    } else {
      setValueDevelopment('');
      setValueProduction('');
    }
  }, [defaultKey, defaultValue]);

  return (
    <Container fuild>
      <Grid.Row>
        <Grid.Column>
          <Header as="h1">
            {defaultValue === undefined ? (
              <TransComponent id="form_title_new" />
            ) : (
              <TransComponent id="form_title_update" />
            )}
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Container fluid>
          <Form
            onSubmit={() => onSubmit(key, valueDevelopment, valueProduction)}
          >
            <Form.Field required>
              <Form.Input
                disabled={!!defaultValue}
                label={i18n.t('table_header_key')}
                value={key}
                onChange={(_: any, data: { value: string }) =>
                  handleChangeKey(data.value)
                }
                required
                focus
              />
            </Form.Field>
            <Form.Field required>
              <Form.Input
                label={i18n.t('module_env_form_development_value_label')}
                value={valueDevelopment}
                onChange={(_: any, data: { value: string }) =>
                  setValueDevelopment(data.value)
                }
                required
                focus
              />
            </Form.Field>
            <Form.Field required>
              <Form.Input
                label={i18n.t('module_env_form_production_value_label')}
                value={valueProduction}
                onChange={(_: any, data: { value: string }) =>
                  setValueProduction(data.value)
                }
                required
                focus
              />
            </Form.Field>
            <Button
              type="submit"
              // disabled={
              //   key === '' ||
              //   value === '' ||
              //   (Array.isArray(value) && value.length === 0)
              // }
              // disabled={disableForm}
            >
              {i18n.t('module_translation_form_field_submit')}
            </Button>
          </Form>
        </Container>
      </Grid.Row>
    </Container>
  );
};

export default EnvsFormComponent;
