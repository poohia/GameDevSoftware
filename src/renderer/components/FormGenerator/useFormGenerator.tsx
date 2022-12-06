import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, Form, Grid, Header } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { FormField } from 'types';
import TransComponent from '../TransComponent';
import {
  FieldMultipleComponent,
  FieldComponent,
  TranslationInput,
  ColorPicker,
  InputComponent,
  GameObjectInput,
} from './components';
import AssetInput from './components/AssetInput';
import { FieldComponentProps } from './components/FieldComponent';
import SceneInput from './components/SceneInput';
import ConstantValueInput from './components/ConstantValueInput';
import SpriteInput from './components/SpriteInput';

export type FormGeneratorProps = {
  form: any;
  type: string;
  defaultValues?: any;
  onSubmit: (data: any) => void;
};

export const mergeDeeply = (obj1: any, obj2: any) => {
  for (const key of Object.keys(obj1)) {
    if (obj2[key] === undefined) {
      obj2[key] = obj1[key];
    }
  }

  return obj2;
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
        required: !optional && !core?.optional,
      };
      let defaultValue = undefined;

      if (defaultValues && typeof defaultValues[key] !== 'undefined') {
        defaultValue = defaultValues[key];
      }
      if (
        parent &&
        defaultValues &&
        typeof defaultValues[parent] !== 'undefined'
      ) {
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
              {...rest}
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
              {...rest}
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
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (typeof core === 'string' && core.startsWith('@go:')) {
        return (
          <FieldComponent {...defaultProps}>
            <GameObjectInput
              type={core.replace('@go:', '')}
              defaultValue={defaultValue}
              onChange={(data) => onChange(core, key, data, parent)}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'sprite') {
        console.log(core);
        return (
          <FieldComponent {...defaultProps} isObject>
            <SpriteInput
              defaultValue={defaultValue}
              onChange={(data) => onChange(core, key, data, parent)}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'scene') {
        return (
          <FieldComponent {...defaultProps}>
            <SceneInput
              defaultValue={defaultValue}
              onChange={(data) => onChange(core, key, data, parent)}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (typeof core === 'string' && core.startsWith('@c:')) {
        return (
          <FieldComponent {...defaultProps}>
            <ConstantValueInput
              type={core}
              onChange={(data) => {
                onChange(core, key, data, parent);
              }}
              multiple={multiple}
              defaultValue={defaultValue}
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
                required={!core.optional}
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
                if (defaultValues === undefined) {
                  onSubmit({ ...value, _type });
                } else {
                  onSubmit({ ...mergeDeeply(defaultValues, value), _type });
                }
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
