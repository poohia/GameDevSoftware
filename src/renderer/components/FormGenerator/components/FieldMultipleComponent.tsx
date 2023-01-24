import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Header, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { FieldMultipleComponentProps } from 'types';
import TransComponent from '../../TransComponent';
import { useFormikContext } from 'formik';

const FieldMultipleComponent: React.FunctionComponent<
  FieldMultipleComponentProps
> = (props) => {
  const {
    keyValue,
    core,
    defaultValue,
    required = true,
    generateField,
  } = props;

  const [items, setItems] = useState<number[]>([]);
  const [values, setValues] = useState<{ id: Number; value: any }[]>([]);
  const { setFieldValue } = useFormikContext();

  const handleRemove = useCallback(
    (item: number) => {
      const _values = Array.from(values.filter((value) => value.id !== item));
      setItems(Array.from(items.filter((i) => i !== item)));
      setValues(_values);
      console.log(keyValue, core, item);
      setFieldValue(`${keyValue}[${item}]`, undefined);
    },
    [items, values]
  );

  const appendItem = useCallback(() => {
    const nextItem =
      items.length > 0
        ? Array.from(items.concat(items[items.length - 1] + 1))
        : [0];
    setItems(nextItem);
  }, [items]);

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
      setItems(required ? [0] : []);
    }
  }, [defaultValue, required]);

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
                  {(!required ? true : item > 0) && (
                    <Button
                      icon
                      color="red"
                      basic
                      type="button"
                      onClick={() => handleRemove(item)}
                    >
                      <Icon name="delete" />
                    </Button>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  {Object.keys(core).map((c) => (
                    <React.Fragment>
                      {generateField({
                        key: `${keyValue}.${item}.${c}`,
                        core: core[c],
                        label: c,
                      })}
                    </React.Fragment>
                  ))}
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
          onClick={appendItem}
        >
          <TransComponent id="form_button_add" />
          <Icon name="add" />
        </Button>
      </Grid.Row>
    </Grid>
  );
};

export default FieldMultipleComponent;
