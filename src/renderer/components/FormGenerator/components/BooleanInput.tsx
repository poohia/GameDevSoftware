import { useEffect, useState } from 'react';
import { Checkbox } from 'semantic-ui-react';
import { CustomInputProps } from 'types';

const BooleanInput: React.FC<CustomInputProps & { label: string }> = (
  props
) => {
  const { label, defaultValue, onChange } = props;
  console.log('🚀 ~ file: BooleanInput.tsx:9 ~ defaultValue', defaultValue);
  const [value, setValue] = useState<boolean>(!!defaultValue);

  useEffect(() => {
    onChange(value);
  }, [value]);

  return (
    <Checkbox checked={value} onChange={() => setValue(!value)} label={label} />
  );
};

export default BooleanInput;
