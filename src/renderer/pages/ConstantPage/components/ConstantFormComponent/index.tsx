import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Dropdown,
  DropdownProps,
  Form,
  Grid,
  Header,
} from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ConstantType, ConstantValue } from 'types';

type ConstantFormComponentProps = {
  defaultKey: string;
  defaultValue?: ConstantValue;
  onSubmit: (key: string, value: ConstantValue) => void;
};
const options: DropdownProps['options'] = [
  {
    key: 'string',
    text: 'String',
    value: 'string',
  },
  { key: 'number', text: 'Number', value: 'number' },
  { key: 'string[]', text: 'Array of string', value: 'string[]' },
  { key: 'number[]', text: 'Array of number', value: 'number[]' },
];
const ConstantFormComponent = (props: ConstantFormComponentProps) => {
  const { defaultKey, defaultValue, onSubmit } = props;
  const [key, setKey] = useState<string>(defaultKey);
  const [type, setType] = useState<ConstantType>('string');
  const [value, setValue] = useState<ConstantValue>(defaultValue || '');

  const handleSubmit = useCallback(() => {
    if (type === 'number[]' && Array.isArray(value)) {
      onSubmit(
        key,
        value.map((v) => Number(v))
      );
      return;
    } else if (type === 'number') {
      onSubmit(key, Number(value));
    } else {
      onSubmit(key, value);
    }
  }, [key, value]);

  useEffect(() => {
    setKey(defaultKey);
  }, [defaultKey]);

  useEffect(() => {
    if (Array.isArray(defaultValue) && typeof defaultValue[0] === 'number') {
      setType('number[]');
    } else if (Array.isArray(defaultValue)) {
      setType('string[]');
    } else if (typeof defaultValue === 'number') {
      setType('number');
    } else {
      setType('string');
    }

    if (!defaultValue) {
      setValue('');
      return;
    }
    setTimeout(() => {
      if (Array.isArray(defaultValue) && typeof defaultValue[0] === 'number') {
        setValue(defaultValue.map((v) => String(v)));
      } else {
        setValue(defaultValue);
      }
    }, 100);
  }, [defaultValue]);

  useEffect(() => {
    setKey(key.toLocaleLowerCase().replace(' ', '_'));
  }, [key]);

  useEffect(() => {
    switch (type) {
      case 'string':
        setValue('');
        break;
      case 'number':
        setValue(0);
        break;
      case 'string[]':
      case 'number[]':
        setValue([]);
        break;
      default:
        setValue('');
    }
  }, [type]);

  return (
    <Container fluid>
      <Grid className="game-dev-software-form-container">
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              {defaultValue === undefined
                ? i18n.t('module_translation_form_title_new')
                : i18n.t('module_constant_form_title_update')}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container fluid>
            <Form>
              <Form.Field>
                <Form.Input
                  disabled={!!defaultValue}
                  label={i18n.t('module_translation_form_field_key_label')}
                  value={key}
                  onChange={(_: any, data: { value: string }) =>
                    setKey(data.value)
                  }
                  required
                  focus
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  {i18n.t('module_constant_form_field_type_of_constant')}
                </label>
                <Dropdown
                  fluid
                  selection
                  value={type}
                  options={options}
                  onChange={(_, { value }) => setType(value as ConstantType)}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  {i18n.t('module_constant_form_field_type_of_value')}
                </label>
                {type === 'string' && (
                  <Form.Input
                    value={value}
                    onChange={(_: any, data: { value: string }) =>
                      setValue(data.value)
                    }
                  />
                )}
                {type === 'number' && (
                  <Form.Input
                    value={value}
                    onChange={(_: any, data: { value: string }) =>
                      setValue(data.value)
                    }
                    type={'number'}
                  />
                )}
                {Array.isArray(value) && (
                  <Dropdown
                    value={value}
                    options={value.map((v) => ({ key: v, text: v, value: v }))}
                    fluid
                    search
                    multiple
                    allowAdditions
                    selection
                    onAddItem={(_, data) => {
                      if (type === 'number[]' && isNaN(Number(data.value))) {
                        return;
                      }
                      setValue(Array.from(value.concat(data.value)));
                    }}
                    onChange={(_, { value }) => {
                      setValue(value);
                    }}
                  />
                )}
              </Form.Field>
              <Button
                type="submit"
                disabled={
                  key === '' ||
                  value === '' ||
                  (Array.isArray(value) && value.length === 0)
                }
                onClick={handleSubmit}
              >
                {i18n.t('module_translation_form_field_submit')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ConstantFormComponent;
