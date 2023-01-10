import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Dropdown,
  DropdownProps,
  Form,
  Grid,
  Header,
} from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ConstantType, ConstantValue } from 'types';
import { TransComponent } from 'renderer/components';

type ConstantFormComponentProps = {
  defaultKey: string;
  defaultValue?: {
    value: ConstantValue;
    description: string;
    editable: boolean;
    deletable: boolean;
  };
  canEditeDescription?: boolean;
  onSubmit: (constant: {
    key: string;
    value: ConstantValue;
    description?: string;
    editable: boolean;
    deletable: boolean;
  }) => void;
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
  const {
    defaultKey,
    defaultValue,
    canEditeDescription = true,
    onSubmit,
  } = props;
  const [key, setKey] = useState<string>(defaultKey);
  const [type, setType] = useState<ConstantType>('string');
  const [value, setValue] = useState<ConstantValue>(defaultValue?.value || '');
  const [description, setDescription] = useState<string>(
    defaultValue?.description || ''
  );
  const [editable, setEditable] = useState<boolean>(
    defaultValue?.editable || true
  );
  const [deletable, setDeletable] = useState<boolean>(
    defaultValue?.deletable || true
  );

  const disableForm = useMemo(
    () => (defaultValue ? !defaultValue.editable : false),
    [defaultValue]
  );

  const handleSubmit = useCallback(() => {
    if (type === 'number[]' && Array.isArray(value)) {
      onSubmit({
        key,
        value: value.map((v) => Number(v)),
        description,
        editable,
        deletable,
      });
    } else if (type === 'number') {
      onSubmit({ key, value: Number(value), description, editable, deletable });
    } else {
      onSubmit({ key, value, description, editable, deletable });
    }
  }, [key, value, description, editable, deletable]);

  useEffect(() => {
    setKey(defaultKey);
  }, [defaultKey]);

  useEffect(() => {
    if (!defaultValue) {
      setValue('');
      setType('string');
      setEditable(true);
      setDeletable(true);
      return;
    }
    const { value } = defaultValue;
    if (Array.isArray(value) && typeof value[0] === 'number') {
      setType('number[]');
    } else if (Array.isArray(value)) {
      setType('string[]');
    } else if (typeof value === 'number') {
      setType('number');
    } else {
      setType('string');
    }
    setTimeout(() => {
      if (Array.isArray(value) && typeof value[0] === 'number') {
        setValue(value.map((v) => String(v)));
      } else {
        setValue(value);
      }
    }, 100);
    setEditable(!!defaultValue.editable);
    setDeletable(!!defaultValue.deletable);
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
              {defaultValue === undefined ? (
                <TransComponent id="module_translation_form_title_new" />
              ) : (
                <TransComponent id="module_constant_form_title_update" />
              )}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container fluid>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <Form.Input
                  disabled={!!defaultValue || disableForm}
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
                  disabled={disableForm}
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
                    disabled={disableForm}
                  />
                )}
                {type === 'number' && (
                  <Form.Input
                    value={value}
                    onChange={(_: any, data: { value: string }) =>
                      setValue(data.value)
                    }
                    type={'number'}
                    disabled={disableForm}
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
                    disabled={disableForm}
                    onAddItem={(_, data) => {
                      if (type === 'number[]' && isNaN(Number(data.value))) {
                        setValue(JSON.parse(JSON.stringify(value)));
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
              <Form.Field>
                <Form.Input
                  label={i18n.t(
                    'module_translation_form_field_description_label'
                  )}
                  value={description}
                  onChange={(_: any, data: { value: string }) =>
                    setDescription(data.value)
                  }
                  disabled={!canEditeDescription || disableForm}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={editable}
                  onChange={() => setEditable(!editable)}
                  disabled={!canEditeDescription || disableForm}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={deletable}
                  onChange={() => setDeletable(!deletable)}
                  disabled={
                    !canEditeDescription ||
                    disableForm ||
                    (defaultValue ? !defaultValue.deletable : false)
                  }
                />
              </Form.Field>
              <Button
                type="submit"
                disabled={
                  key === '' ||
                  value === '' ||
                  (Array.isArray(value) && value.length === 0) ||
                  disableForm
                }
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
