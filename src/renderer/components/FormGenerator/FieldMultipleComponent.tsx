import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormField, Grid, Header, Icon } from 'semantic-ui-react';
import TransComponent from '../TransComponent';

type FieldMultipleComponentProps = {
  keyValue: string;
  core: any;
  components: any[];
  defaultValue?: any;
  onChange: (values: any) => void;
};

const FieldMultipleComponent: React.FunctionComponent<
  FieldMultipleComponentProps
> = (props) => {
  const { keyValue, components, core, defaultValue, onChange } = props;
  const [items, setItems] = useState<number[]>([]);
  const [values, setValues] = useState<{ id: Number; value: any }[]>([]);
  const handleChange = useCallback(
    (item: number, _core: any, key: string, value: any) =>
      setValues((_values) => {
        const valueFind = _values.find((v) => v.id === item);
        if (valueFind) {
          valueFind.value[key] = value;
        } else {
          _values.push({
            id: item,
            value: {
              [key]: value,
            },
          });
        }
        return Array.from(_values);
      }),
    []
  );

  const handleRemove = useCallback(
    (item: number) => {
      setItems(Array.from(items.filter((i) => i !== item)));
      setValues(Array.from(values.filter((value) => value.id !== item)));
    },
    [items, values]
  );

  const sendOnChange = useCallback(() => {
    const definitiveValue: any = {};
    definitiveValue[keyValue] = [];
    values.forEach((value) => {
      const v: any = {};
      Object.keys(value.value).forEach((key) => {
        v[key] = value.value[key];
      });
      definitiveValue[keyValue].push(v);
    });
    onChange(definitiveValue);
  }, [onChange, keyValue, values]);

  useEffect(() => {
    if (defaultValue) {
      setValues(
        defaultValue.map((v: any, i: number) => ({
          id: i,
          value: v,
        }))
      );
      setItems(defaultValue.map((_: any, i: number) => i));
    } else {
      setItems([0]);
    }
  }, [defaultValue]);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          {items.map((item) => (
            <Grid key={item}>
              <Grid.Row>
                <Grid.Column floated="left" width={14}>
                  <Header as="h3">{item}.</Header>
                </Grid.Column>
                <Grid.Column width={2} floated="right">
                  {item > 0 && (
                    <Button
                      icon
                      color="red"
                      basic
                      onClick={() => handleRemove(item)}
                    >
                      <Icon name="delete" />
                    </Button>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  {components.map((Component, i) => {
                    const defaultValueFind = values.find(
                      (v) => v.id === item
                    )?.value;
                    return (
                      <React.Fragment key={`${keyValue}-${i}`}>
                        <FormField>
                          <Component
                            onChange={(core: any, key: string, value: any) =>
                              handleChange(item, core, key, value)
                            }
                            onBlur={sendOnChange}
                            defaultValue={
                              defaultValueFind &&
                              defaultValueFind[Object.keys(core)[i]]
                            }
                          />
                        </FormField>
                      </React.Fragment>
                    );
                  })}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          ))}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Button
          color="green"
          type="button"
          icon
          labelPosition="right"
          onClick={() =>
            setItems(Array.from(items.concat(items[items.length - 1] + 1)))
          }
        >
          <TransComponent id="form_button_add" />
          <Icon name="add" />
        </Button>
      </Grid.Row>
    </Grid>
  );
};

export default FieldMultipleComponent;
