import { useCallback, useEffect, useState } from 'react';
import { PhotoshopPicker } from 'react-color';
import { CustomInputProps } from 'types';
import InputComponent from './InputComponent';

const ColorPicker = (props: CustomInputProps) => {
  const { defaultValue, onChange, onBlur } = props;
  const [showColorPick, setShowColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const handleSubmit = useCallback(
    (c = color) => {
      setShowColorPicker(false);
      setValue(c);
      onChange(c);
      setTimeout(() => onBlur && onBlur(), 500);
    },
    [color]
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      setColor(defaultValue);
    }
  }, [defaultValue]);

  if (!showColorPick) {
    return (
      <InputComponent
        defaultValue={value}
        onChange={(color) => handleSubmit(color)}
        type="string"
      >
        <div
          className="ui selection dropdown fluid"
          onClick={() => setShowColorPicker(true)}
        >
          {!value.startsWith('@c:') ? <span>{value}</span> : <span></span>}
        </div>
      </InputComponent>
    );
  }

  return (
    <PhotoshopPicker
      color={color}
      onChange={(color) => setColor(color.hex)}
      onAccept={() => handleSubmit()}
      onCancel={() => setShowColorPicker(false)}
    />
  );
};

export default ColorPicker;
