import { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoshopPicker } from 'react-color';
import { CustomInputProps } from 'types';
import InputComponent from './InputComponent';

const ColorPicker = (props: CustomInputProps) => {
  const { defaultValue, name, onChange, onBlur } = props;
  const [showColorPick, setShowColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (c = color) => {
      setShowColorPicker(false);
      setValue(c);
      if (inputRef.current) {
        inputRef.current.value = c;
        onChange({ target: inputRef.current });
      }
      setTimeout(() => onBlur && onBlur(), 500);
    },
    [color, inputRef]
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      setColor(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      {!showColorPick && (
        <InputComponent
          defaultValue={value}
          onChange={(e) => handleSubmit(e.target.value)}
          type="string"
        >
          <div
            className="ui selection dropdown fluid"
            onClick={() => setShowColorPicker(true)}
          >
            {!value.startsWith('@c:') ? <span>{value}</span> : <span></span>}
          </div>
        </InputComponent>
      )}
      {showColorPick && (
        <PhotoshopPicker
          color={color}
          onChange={(color) => setColor(color.hex)}
          onAccept={() => handleSubmit()}
          onCancel={() => setShowColorPicker(false)}
        />
      )}
      <input type="hidden" name={name} ref={inputRef} />
    </>
  );
};

export default ColorPicker;
