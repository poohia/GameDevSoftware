import { useEffect, useState } from 'react';
import { Checkbox } from 'semantic-ui-react';
import { CustomInputProps } from 'types';

const BooleanInput: React.FC<
  Omit<CustomInputProps, 'onChange' | 'name'> & {
    label: string;
    onChange: (value: boolean) => void;
  }
> = (props) => {
  const { label, defaultValue, onChange } = props;
  const [value, setValue] = useState<boolean>(!!defaultValue);

  useEffect(() => {
    onChange(value);
  }, [value]);

  useEffect(() => {
    setValue(!!defaultValue);
  }, [defaultValue]);

  return (
    <>
      <Checkbox
        checked={value}
        onChange={() => setValue(!value)}
        label={label}
      />
    </>
  );
};

export default BooleanInput;
