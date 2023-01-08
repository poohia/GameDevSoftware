import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import { ModalProps } from 'semantic-ui-react';
import { CustomInputProps } from 'types';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';
import ScenesContext from 'renderer/contexts/ScenesContext';

const ModalSceneInput = (
  props: ModalProps & {
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
  }
) => {
  const { open, defaultValue, onClose, onSubmit, ...rest } = props;
  const { scenes } = useContext(ScenesContext);
  const [value, setValue] = useState<string>('');
  const handleClickRow = useCallback(
    (id: number) => {
      setValue(`@s:${id}`);
    },
    [scenes]
  );
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.replace('@s:', ''));
    }
  }, [defaultValue]);

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onSubmit(value)}
      title={<TransComponent id="form_input_modal_assets_title" />}
      disableAccepted={value === ''}
      {...rest}
    >
      <GameobjectTableComponent
        gameObjects={scenes}
        keySelected={Number(value.replace('@s:', ''))}
        onClickRow={handleClickRow}
      />
    </ModalComponent>
  );
};

const SceneInput = (props: CustomInputProps) => {
  const { defaultValue, name, onChange, onBlur } = props;
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
      <ModalSceneInput
        open={openModal}
        defaultValue={defaultValue}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
      <input type="hidden" name={name} ref={inputRef} />
    </>
  );
};

export default SceneInput;
