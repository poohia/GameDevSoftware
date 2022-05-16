import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Form, Grid, Header, Input } from 'semantic-ui-react';
import { FormField } from 'types';
import TransComponent from '../TransComponent';
import {
  FieldMultipleComponent,
  FieldComponent,
  TranslationInput,
  ColorPicker,
  InputComponent,
} from './components';
import AssetInput from './components/AssetInput';
import { FieldComponentProps } from './components/FieldComponent';

export type FormGeneratorProps = {
  form: any;
  type: string;
  defaultValues?: any;
  onSubmit: (data: any) => void;
};

const useFormGenerator = (props: FormGeneratorProps) => {
  const { form, type: _type, defaultValues, onSubmit } = props;

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
          let _v = v;
          if (
            core === 'number' &&
            !(typeof v === 'string' && v.startsWith('@c:'))
          ) {
            _v = Number(v);
          }
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
      let defaultValue = undefined;

      if (defaultValues && defaultValues[key]) {
        defaultValue = defaultValues[key];
      }
      if (parent && defaultValues && defaultValues[parent]) {
        defaultValue = defaultValues[parent][key];
      }
      if (core === 'string' || core === 'number') {
        return (
          <FieldComponent {...defaultProps}>
            <InputComponent
              id={key}
              type={core}
              onChange={(data) => onChange(core, key, data, parent)}
              defaultValue={defaultValue}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (
        core === 'image' ||
        core === 'json' ||
        core === 'video' ||
        core === 'sound'
      ) {
        return (
          <FieldComponent {...defaultProps}>
            <AssetInput
              type={core}
              onChange={(data) => onChange(core, key, data, parent)}
              defaultValue={defaultValue}
            />
          </FieldComponent>
        );
      }
      if (core === 'color') {
        return (
          <FieldComponent {...defaultProps}>
            <ColorPicker
              defaultValue={defaultValue}
              onChange={(data) => onChange(core, key, data, parent)}
            />
          </FieldComponent>
        );
      }
      if (core === 'translation') {
        return (
          <FieldComponent {...defaultProps}>
            <TranslationInput
              defaultValue={defaultValue}
              onChange={(data) => onChange(core, key, data, parent)}
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
              defaultValue={defaultValue}
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
                defaultValue={defaultValue}
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
    [value, defaultValues]
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
                onSubmit({ ...defaultValues, ...value, _type });
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
  }, [value, defaultValues]);

  useEffect(() => {
    setValue({});
  }, [defaultValues]);

  return FormGeneratedComponent;
};

export default useFormGenerator;
