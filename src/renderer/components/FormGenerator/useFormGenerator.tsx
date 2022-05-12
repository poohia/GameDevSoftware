import React, { useCallback, useMemo, useState } from 'react';
import { Button, Dropdown, Form, Grid, Header, Input } from 'semantic-ui-react';
import { FormField } from 'types';
import TransComponent from '../TransComponent';
import FieldComponent, { FieldComponentProps } from './FieldComponent';

export type FormGeneratorProps = {
  form: any;
  type: string;
  defaultValue?: any;
};

const useFormGenerator = (props: FormGeneratorProps) => {
  const { form, type, defaultValue } = props;
  const [value, setValue] = useState<any>({});

  const handleChange = useCallback(
    (core: any, key: string, v: any, parent?: string) => {
      setValue((_value: any) => {
        const defKey = parent ? parent : key;
        if (typeof core === 'string') {
          const _v = core === 'number' ? Number(v) : v;
          return JSON.parse(
            JSON.stringify({
              ..._value,
              [defKey]: parent ? { ..._value[defKey], [key]: _v } : _v,
            })
          );
        }
        if (Array.isArray(core)) {
          return JSON.parse(
            JSON.stringify({
              ..._value,
              [defKey]: parent ? { ..._value[defKey], [key]: v } : v,
            })
          );
        }
        return JSON.parse(
          JSON.stringify({
            ..._value,
            [defKey]: parent ? { ..._value[defKey], [key]: v } : v,
          })
        );
      });
    },
    []
  );

  const generateField = useCallback((field: FormField): any => {
    const { core, key, description, label, multiple, optional, parent } = field;

    const defaultProps: Omit<FieldComponentProps, 'children'> = {
      keyValue: key,
      label: label || key,
      description,
      required: !optional,
    };
    if (core === 'string' || core === 'number') {
      return (
        <FieldComponent {...defaultProps}>
          <Input
            id={key}
            type={core}
            onChange={(_, data) => handleChange(core, key, data.value, parent)}
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
            options={core.map((value) => ({ text: value, value, key: value }))}
            onChange={(_, data) => handleChange(core, key, data.value, parent)}
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
              <React.Fragment key={`${key}-${core.core[coreKey]}`}>
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

      return generateField({ ...core, key, parent });
    }

    return <div />;
  }, []);

  const FormGeneratedComponent = useMemo(() => {
    return () => (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              <TransComponent
                id={
                  defaultValue === undefined
                    ? 'form_title_new_type'
                    : 'form_title_update_type'
                }
                values={[{ key: 'type', value: type }]}
              />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
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

  console.log(value);

  return FormGeneratedComponent;
};

export default useFormGenerator;
