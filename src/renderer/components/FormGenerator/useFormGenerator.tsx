import React, { useCallback, useMemo, useState } from 'react';
import { Button, Dropdown, Form, Grid, Header, Input } from 'semantic-ui-react';
import { FormField } from 'types';
import TransComponent from '../TransComponent';
import FieldComponent, { FieldComponentProps } from './FieldComponent';
import FieldMultipleComponent from './FieldMultipleComponent';

export type FormGeneratorProps = {
  form: any;
  type: string;
  defaultValues?: any;
  onSubmit: (data: any) => void;
};

const useFormGenerator = (props: FormGeneratorProps) => {
  const { form, type: _type, defaultValues = {}, onSubmit } = props;
  console.log(
    '🚀 ~ file: useFormGenerator.tsx ~ line 17 ~ useFormGenerator ~ defaultValue',
    defaultValues
  );
  const [value, setValue] = useState<any>({});

  const handleChangeMultiple = useCallback((data: any) => {
    setValue((_value: any) => {
      const key = Object.keys(data)[0];
      _value[key] = data[key];
      return _value;
    });
  }, []);

  const handleChange = useCallback(
    (core: any, key: string, v: any, parent?: string) => {
      setValue((_value: any) => {
        const defKey = parent ? parent : key;
        if (typeof core === 'string') {
          const _v = core === 'number' ? Number(v) : v;
          _value[defKey] = parent ? { ..._value[defKey], [key]: _v } : _v;
        } else if (Array.isArray(core)) {
          _value[defKey] = parent ? { ..._value[defKey], [key]: v } : v;
        } else {
          _value[defKey] = parent ? { ..._value[defKey], [key]: v } : v;
        }
        return _value;
      });
    },
    []
  );

  const generateField = useCallback(
    (field: FormField): any => {
      const {
        core,
        key,
        description,
        label,
        multiple,
        optional,
        parent,
        onChange = handleChange,
        ...rest
      } = field;

      const defaultProps: Omit<FieldComponentProps, 'children'> = {
        keyValue: key,
        label: label || key,
        description,
        required: !optional,
      };
      // let defaultValue = undefined;

      // if (defaultValues[key]) {
      //   defaultValue = defaultValues[key];
      // }
      // if (parent && defaultValues[parent]) {
      //   defaultValue = defaultValues[parent][key];
      // }
      if (core === 'string' || core === 'number') {
        return (
          <FieldComponent {...defaultProps}>
            <Input
              id={key}
              type={core}
              onChange={(_, data) => onChange(core, key, data.value, parent)}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (Array.isArray(core)) {
        return (
          <FieldComponent {...defaultProps}>
            <Dropdown
              fluid
              selection
              search
              multiple={multiple}
              id={key}
              options={core.map((v) => ({
                text: v,
                value: v,
                key: v,
              }))}
              onChange={(_, data) => onChange(core, key, data.value, parent)}
              {...rest}
            ></Dropdown>
          </FieldComponent>
        );
      }

      if (typeof core === 'object') {
        if (Array.isArray(core.core)) {
          return generateField({ ...core, core: core.core, key, parent });
        }
        if (typeof core.core === 'object' && !core.multiple) {
          return (
            <FieldComponent
              {...defaultProps}
              isObject
              description={core.description}
              label={core.label || key}
            >
              {Object.keys(core.core).map((coreKey) => (
                <React.Fragment key={`${key}-${coreKey}`}>
                  {generateField({
                    key: coreKey,
                    core: core.core[coreKey],
                    parent: key,
                  })}
                </React.Fragment>
              ))}
            </FieldComponent>
          );
        }
        if (typeof core.core === 'object' && core.multiple) {
          return (
            <FieldComponent
              {...defaultProps}
              isObject
              description={core.description}
              label={core.label || key}
            >
              <FieldMultipleComponent
                keyValue={key}
                core={core.core}
                components={Object.keys(core.core).map((coreKey) => {
                  return (props: any) => (
                    <React.Fragment key={`${key}-${core.core[coreKey]}`}>
                      {generateField({
                        key: coreKey,
                        core: core.core[coreKey],
                        parent: key,
                        ...props,
                      })}
                    </React.Fragment>
                  );
                })}
                onChange={handleChangeMultiple}
              />
            </FieldComponent>
          );
        }

        return generateField({ ...core, key, parent });
      }

      return <div />;
    },
    [value]
  );

  const FormGeneratedComponent = useMemo(() => {
    return () => (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              <TransComponent
                id={
                  defaultValues === undefined
                    ? 'form_title_new_type'
                    : 'form_title_update_type'
                }
                values={[{ key: 'type', value: _type }]}
              />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form
              onSubmit={() => {
                onSubmit({ ...value, _type });
              }}
            >
              {Object.keys(form).map((key) => (
                <React.Fragment key={key}>
                  {generateField({ key, core: form[key] })}
                </React.Fragment>
              ))}
              <Button type="submit">Submit</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }, [props]);

  return FormGeneratedComponent;
};

export default useFormGenerator;
