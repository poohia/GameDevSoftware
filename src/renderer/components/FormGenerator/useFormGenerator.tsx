import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldArray, FormikProvider, useFormik } from 'formik';
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
  BooleanInput,
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

const useFormGenerator = (props: FormGeneratorProps) => {
  const { form = [], type: _type, defaultValues, onSubmit } = props;

  const formik = useFormik<any>({
    initialValues: defaultValues ? defaultValues : {},
    onSubmit: (values) => {
      onSubmit({ ...values, _type });
    },
    enableReinitialize: true,
  });

  const getDefaultValue = useCallback(
    (key: string) => {
      const meta = formik.getFieldMeta(key);
      if (meta) {
        return meta.value;
      }
      return undefined;
    },
    [formik.initialValues]
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
        onChange = () => {},
        ...rest
      } = field;

      const defaultProps: Omit<FieldComponentProps, 'children'> = {
        keyValue: key,
        label: label || key,
        description,
        required: !optional && !core?.optional,
      };
      let defaultValue = getDefaultValue(key);

      if (core === 'string' || core === 'number') {
        return (
          <FieldComponent {...defaultProps}>
            <InputComponent
              name={key}
              type={core}
              onChange={formik.handleChange}
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
      if (core === 'boolean') {
        return (
          <BooleanInput
            onChange={(data) => {
              onChange(core, key, data, parent);
            }}
            defaultValue={defaultValue}
            label={defaultProps.label}
            {...rest}
          />
        );
      }
      if (core === 'sprite') {
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

      if (typeof core === 'object') {
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
                    key: `${key}.${coreKey}`,
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
                generateField={generateField}
              />
            </FieldComponent>
          );
        }
        return generateField({ ...core, key });
      }
      return <div />;
    },
    [formik.initialValues]
  );

  const FormGeneratedComponent = useMemo(() => {
    return (
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
            <Form onSubmit={formik.handleSubmit}>
              <FormikProvider value={formik}>
                {Object.keys(form).map((key) => (
                  <React.Fragment key={key}>
                    {generateField({ key, core: form[key] })}
                  </React.Fragment>
                ))}
                <Button type="submit">Submit</Button>
              </FormikProvider>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }, [formik.initialValues]);

  return FormGeneratedComponent;
};

export default useFormGenerator;
