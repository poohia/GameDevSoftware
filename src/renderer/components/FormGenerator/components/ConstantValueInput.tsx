import { useContext, useEffect, useMemo } from 'react';
import ConstantsContext from 'renderer/contexts/ConstantsContext';
import { Dropdown } from 'semantic-ui-react';
import { CustomInputProps } from 'types';

const ConstantValueInput: React.FC<
  Omit<CustomInputProps, 'onChange' | 'name'> & {
    type: string;
    onChange: (
      value?: boolean | number | string | (boolean | number | string)[]
    ) => void;
  }
> = (props) => {
  const { type, multiple, defaultValue, onChange } = props;
  const { constants } = useContext(ConstantsContext);

  const constant = useMemo(
    () => constants.find((c) => c.key === type.replace('@c:', '')),
    [constants, type]
  );

  useEffect(() => {
    if (constant && !Array.isArray(constant.value)) {
      onChange(constant.value);
    }
  }, [constant]);

  if (!constant) return <div />;
  if (Array.isArray(constant.value)) {
    return (
      <Dropdown
        fluid
        selection
        search
        multiple={multiple}
        defaultValue={defaultValue}
        options={constant.value.map((v) => ({
          text: v,
          value: v,
          key: v,
        }))}
        onChange={(_e, data) => onChange(data.value)}
      />
    );
  }
  return (
    <div>
      <span>{constant.value}</span>
    </div>
  );
};

export default ConstantValueInput;
