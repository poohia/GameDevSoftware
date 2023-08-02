import React, { useCallback, useMemo } from 'react';
import { FormikProvider, useFormik } from 'formik';
import { Form, Grid, Header, Icon } from 'semantic-ui-react';
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
  ConstantValueInput,
  AssetInput,
  SceneInput,
  SpriteInput,
} from './components';
import { FieldComponentProps } from './components/FieldComponent';
import DropDownFontsComponent from '../DropDownFontsComponent';

export type FormGeneratorProps = {
  form: any;
  type: string;
  defaultValues?: any;
  loading?: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  onOpenFileClick?: () => void;
};

const useFormGenerator = (props: FormGeneratorProps) => {
  const {
    form = [],
    type: _type,
    defaultValues,
    loading,
    onSubmit,
    onClose,
    onOpenFileClick,
  } = props;

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
        ...rest
      } = field;

      const defaultProps: Omit<FieldComponentProps, 'children'> = {
        keyValue: key,
        label: label || key,
        description,
        required: !optional && !core?.optional,
      };
      const defaultValue = getDefaultValue(key);
      const onChange = formik.handleChange;

      if (core === 'string' || core === 'number' || core === 'float') {
        return (
          <FieldComponent {...defaultProps}>
            <InputComponent
              name={key}
              onChange={onChange}
              defaultValue={defaultValue}
              type={core === 'float' ? 'number' : core}
              step={core === 'float' ? '.01' : '1'}
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
              name={key}
              onChange={onChange}
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
              name={key}
              defaultValue={defaultValue}
              onChange={onChange}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'translation') {
        return (
          <FieldComponent {...defaultProps}>
            <TranslationInput
              name={key}
              defaultValue={defaultValue}
              onChange={onChange}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'font') {
        return (
          <FieldComponent {...defaultProps}>
            <DropDownFontsComponent
              defaultValue={defaultValue}
              onChange={(_e, { value }) => formik.setFieldValue(key, value)}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (typeof core === 'string' && core.startsWith('@go:')) {
        return (
          <FieldComponent {...defaultProps}>
            <GameObjectInput
              name={key}
              type={core.replace('@go:', '')}
              defaultValue={defaultValue}
              multiple={multiple}
              optional={optional}
              onChange={(value) => {
                formik.setFieldValue(key, value);
              }}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'boolean') {
        return (
          <FieldComponent {...defaultProps} label="" required={false}>
            <BooleanInput
              onChange={(value) => {
                formik.setFieldValue(key, value);
              }}
              defaultValue={defaultValue}
              label={defaultProps.label}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'sprite') {
        return (
          <FieldComponent {...defaultProps} isObject>
            <SpriteInput
              defaultValue={defaultValue}
              onChange={(value) => {
                formik.setFieldValue(key, value);
              }}
              {...rest}
            />
          </FieldComponent>
        );
      }
      if (core === 'scene') {
        return (
          <FieldComponent {...defaultProps}>
            <SceneInput
              name={key}
              defaultValue={defaultValue}
              onChange={onChange}
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
              onChange={(value) => {
                formik.setFieldValue(key, value);
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
              <Button type="submit" loading={loading}>
                <TransComponent id="form_action_submit" />
              </Button>
              {defaultValues !== undefined && onOpenFileClick && (
                <Button
                  type="button"
                  loading={loading}
                  color={'brown'}
                  onClick={onOpenFileClick}
                >
                  <TransComponent id="module_translation_form_field_acton_open_file" />
                </Button>
              )}
              <Icon
                name="close"
                size="big"
                style={{
                  float: 'right',
                  cursor: 'pointer',
                  // position: 'relative',
                  // bottom: '20px',
                  marginBottom: '20px',
                }}
                onClick={onClose}
              />
              <br />
              <FormikProvider value={formik}>
                {Object.keys(form).map((key) => (
                  <React.Fragment key={key}>
                    {generateField({ key, core: form[key] })}
                  </React.Fragment>
                ))}
                <Button type="submit" loading={loading}>
                  <TransComponent id="form_action_submit" />
                </Button>
                {defaultValues !== undefined && onOpenFileClick && (
                  <Button
                    type="button"
                    loading={loading}
                    color={'brown'}
                    onClick={onOpenFileClick}
                  >
                    <TransComponent id="module_translation_form_field_acton_open_file" />
                  </Button>
                )}
              </FormikProvider>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }, [formik.initialValues, loading]);

  return FormGeneratedComponent;
};

export default useFormGenerator;
