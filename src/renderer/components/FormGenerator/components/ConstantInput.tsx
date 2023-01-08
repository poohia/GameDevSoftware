import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import ConstantsContext from 'renderer/contexts/ConstantsContext';
import { ConstantTableComponent } from 'renderer/pages/ConstantPage/components';
import { ModalProps } from 'semantic-ui-react';
import { ConstantType, CustomInputProps } from 'types';

const ModalConstant = (
  props: ModalProps & {
    type: ConstantType;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
  }
) => {
  const { open, defaultValue, type, onClose, onSubmit, ...rest } = props;
  const { constants } = useContext(ConstantsContext);
  const [value, setValue] = useState<string>('');
  const handleClickRow = useCallback(
    (key: string) => {
      setValue(`@c:${key}`);
    },
    [constants]
  );
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.replace('@c:', ''));
    }
  }, [defaultValue]);

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onSubmit(value)}
      title={<TransComponent id="form_input_modal_constants_title" />}
      disableAccepted={value === ''}
      {...rest}
    >
      <ConstantTableComponent
        canDelete={false}
        onClickRow={handleClickRow}
        onDelete={() => {}}
        constants={constants}
        keySelected={value.replace('@c:', '')}
        defaultFilterType={type}
      />
    </ModalComponent>
  );
};

const ConstantInput = (props: CustomInputProps) => {
  const { defaultValue, type = 'string', name, onChange, onBlur } = props;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      setOpenModal(true);
    },
    []
  );
  const handleSubmit = useCallback(
    (value: string) => {
      setValue(value);
      setOpenModal(false);
      if (inputRef.current) {
        inputRef.current.value = value;
        onChange({ target: inputRef.current });
      }
      setTimeout(() => onBlur && onBlur(), 500);
    },
    [value, inputRef]
  );
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);
  return (
    <>
      <div className="ui selection dropdown fluid" onClick={handleClick}>
        {value && <span>{value}</span>}
      </div>
      <ModalConstant
        open={openModal}
        defaultValue={defaultValue}
        type={type}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
      <input type="hidden" name={name} ref={inputRef} />
    </>
  );
};

export default ConstantInput;
