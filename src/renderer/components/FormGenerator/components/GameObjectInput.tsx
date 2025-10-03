import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import { Dropdown, DropdownItemProps, ModalProps } from 'semantic-ui-react';
import { CustomInputProps, GameObject } from 'types';
import GameObjectContext from 'renderer/contexts/GameObjectContext';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';

const ModalGameObjectInput = (
  props: ModalProps & {
    type: string;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
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
      title={<TransComponent id="module_gameobject_home_title" />}
      disableAccepted={value === ''}
      {...rest}
    >
      <GameobjectTableComponent
        gameObjects={gameObjects}
        keySelected={Number(value.replace('@go:', ''))}
        title="gameobjectinput"
        isOnInput
        typeTarget="gameObjects"
        onClickRow={handleClickRow}
      />
    </ModalComponent>
  );
};

const DropDownGameObjectInput = (props: {
  type: string;
  defaultValue?: string[];
  optional?: boolean;
  onChange: (value: string[]) => void;
}) => {
  const { defaultValue, optional = false, type, onChange } = props;
  const [gameObjects, setGameObjects] = useState<DropdownItemProps[]>([]);
  const { findGameObjectsByType } = useContext(GameObjectContext);
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    } else {
      setValue([]);
    }
  }, [defaultValue]);

  useEffect(() => {
    setGameObjects(
      findGameObjectsByType(type).map((go) => ({
        text: go._title,
        value: `@go:${go._id}`,
        key: `gameobjectinput-go-${go._id}`,
      }))
    );
  }, [type, findGameObjectsByType]);

  return (
    <Dropdown
      fluid
      selection
      search
      multiple
      value={value}
      options={Array.from(gameObjects).reverse()}
      clearable={optional}
      onChange={(_e, data) => {
        setValue(data.value as string[]);
        onChange(data.value as string[]);
      }}
    />
  );
};

const GameObjectInput: React.FC<
  Omit<CustomInputProps, 'onChange' | 'name'> & {
    type: string;
    onChange: (value?: string | string[]) => void;
  }
> = (props) => {
  const {
    defaultValue,
    type,
    multiple = false,
    optional = false,
    clearable = false,
    onChange,
    onBlur,
  } = props;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [value, setValue] = useState<string | string[]>(() => {
    if (defaultValue) {
      return defaultValue;
    } else if (multiple) {
      return [];
    }
    return '';
  });

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      setOpenModal(true);
    },
    []
  );
  const handleSubmit = useCallback(
    (v: string) => {
      if (typeof value === 'string') {
        setValue(v);
      } else {
        setValue(value.concat(v));
      }
      setOpenModal(false);

      onChange(v);

      setTimeout(() => onBlur && onBlur(), 500);
    },
    [value]
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    } else if (multiple) {
      setValue([]);
    } else {
      setValue('');
    }
  }, [defaultValue]);

  if (multiple) {
    return (
      <DropDownGameObjectInput
        onChange={(v) => onChange(v)}
        optional={optional}
        type={type}
        defaultValue={value as string[]}
      />
    );
  }

  return (
    <>
      <div className="ui selection dropdown fluid" onClick={handleClick}>
        {value && <span>{value}</span>}
        {clearable && !!value && (
          <i
            aria-hidden="true"
            className="dropdown icon clear"
            onClick={(event) => {
              event.stopPropagation();
              handleSubmit('');
            }}
          ></i>
        )}
      </div>
      {optional && value !== '' && (
        <span
          onClick={() => {
            onChange();
            setValue('');
          }}
        >
          X
        </span>
      )}
      <ModalGameObjectInput
        open={openModal}
        defaultValue={value as string}
        type={type}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default GameObjectInput;
