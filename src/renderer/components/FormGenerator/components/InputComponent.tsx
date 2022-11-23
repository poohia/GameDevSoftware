import { ReactFragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { Grid, Icon, Input, InputProps } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import ConstantInput from './ConstantInput';

type InputComponentProps = InputProps & {
  onChange: (value: any) => void;
  children?: ReactFragment | ReactNode;
  defaultValue?: string | number;
};

const InputComponent = (props: InputComponentProps) => {
  const { onChange, defaultValue, type, children, ...rest } = props;
  const [inputType, setInputType] = useState<'c' | 'v'>('v');

  const defaultValueConstant = useMemo(() => {
    if (
      defaultValue &&
      typeof defaultValue === 'string' &&
      defaultValue.startsWith('@c:')
    ) {
      return defaultValue;
    }
    return;
  }, [defaultValue]);

  useEffect(() => {
    if (
      defaultValue &&
      typeof defaultValue === 'string' &&
      defaultValue.startsWith('@c:')
    ) {
      setInputType('c');
    }
  }, [defaultValue]);

  const Component = useMemo(() => {
    if (inputType === 'v') {
      if (children) {
        return () => <>{children}</>;
      }

      return () => (
        <Input
          onChange={(_e, { value }) => onChange(value)}
          defaultValue={defaultValue}
          type={type}
          {...rest}
        />
      );
    }
    return () => (
      <ConstantInput
        onChange={onChange}
        type={type}
        defaultValue={defaultValueConstant}
      />
    );
  }, [inputType, type, defaultValue, children, onChange]);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={14}>
          <Component />
        </Grid.Column>
        <Grid.Column width={2}>
          <Button
            type="button"
            basic
            color="blue"
            icon
            labelPosition="right"
            onClick={() =>
              setInputType((_inputType) => (_inputType === 'c' ? 'v' : 'c'))
            }
          >
            {inputType.toUpperCase()}
            <Icon name="refresh" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default InputComponent;
