import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import { ModalProps } from 'semantic-ui-react';
import { CustomInputProps, GameObject } from 'types';
import GameObjectContext from 'renderer/contexts/GameObjectContext';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';

const ModalGameObjectInput = (
  props: ModalProps & {
    type: string;
    defaultValue?: string;
    onSubmit: (value: string) => void;
  }
) => {
  const { open, defaultValue, type, onClose, onSubmit, ...rest } = props;
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const { findGameObjectsByType } = useContext(GameObjectContext);
  const [value, setValue] = useState<string>('');
  const handleClickRow = useCallback(
    (id: number) => {
      setValue(`@go:${id}`);
    },
    [gameObjects]
  );
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.replace('@go:', ''));
    }
  }, [defaultValue]);

  useEffect(() => {
    setGameObjects(findGameObjectsByType(type));
  }, [type, findGameObjectsByType]);

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onSubmit(value)}
      title={<TransComponent id="form_input_modal_assets_title" />}
      closeOnDimmerClick
      dimmer={'inverted'}
      disableAccepted={value === ''}
      {...rest}
    >
      <GameobjectTableComponent
        gameObjects={gameObjects}
        keySelected={Number(value.replace('@go:', ''))}
        onClickRow={handleClickRow}
      />
    </ModalComponent>
  );
};

const GameObjectInput = (props: CustomInputProps) => {
  const { defaultValue, type, name, onChange, onBlur } = props;
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
      <ModalGameObjectInput
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

export default GameObjectInput;
