import { useCallback, useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import i18n from 'translations/i18n';
import {
  Container,
  Dropdown,
  DropdownItemProps,
  Form,
  Grid,
  Header,
} from 'semantic-ui-react';
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

const OptionsEnvs: DropdownItemProps[] = [
  {
    key: 'true',
    value: 'true',
    text: 'true',
  },
  {
    key: 'false',
    value: 'false',
    text: 'false',
  },
];

const EnvsFormComponent: React.FC<EnvsFormComponentProps> = (props) => {
  const { defaultKey, defaultValue, onSubmit } = props;

  const [key, setKey] = useState<string>(defaultKey);
  const [valueDevelopment, setValueDevelopment] = useState<string>('');
  const [valueProduction, setValueProduction] = useState<string>('');
  console.log('🚀 ~ EnvsFormComponent ~ valueProduction:', valueProduction);

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
              <label>{i18n.t('module_env_form_development_value_label')}</label>
              <Dropdown
                fluid
                selection
                value={valueDevelopment}
                options={OptionsEnvs}
                onChange={(_: any, data) => {
                  setValueDevelopment(data.value as string);
                }}
              />
            </Form.Field>
            <Form.Field required>
              <label>{i18n.t('module_env_form_production_value_label')}</label>
              <Dropdown
                fluid
                selection
                value={valueProduction}
                options={OptionsEnvs}
                onChange={(_: any, data) => {
                  setValueProduction(data.value as string);
                }}
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
            <Button
              type="button"
              color={'brown'}
              onClick={() => {
                setValueDevelopment('false');
                setValueProduction('false');
              }}
            >
              <TransComponent id="module_env_set_default_var" />
            </Button>
          </Form>
        </Container>
      </Grid.Row>
    </Container>
  );
};

export default EnvsFormComponent;
