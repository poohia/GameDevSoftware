import { useCallback, useContext, useEffect, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import { Dropdown, DropdownItemProps, ModalProps } from 'semantic-ui-react';
import { CustomInputProps } from 'types';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';
import ScenesContext from 'renderer/contexts/ScenesContext';

const ModalSceneInput = (
  props: ModalProps & {
    type: string;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
  }
) => {
  const { open, defaultValue, type, onClose, onSubmit, ...rest } = props;
  const { scenes } = useContext(ScenesContext);
  const [value, setValue] = useState<string>('');
  const [filteredScenes, setFilteredScenes] = useState(scenes);

  const handleClickRow = useCallback((id: number) => {
    setValue(`@s:${id}`);
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    } else {
      setValue('');
    }
  }, [defaultValue]);

  useEffect(() => {
    setFilteredScenes(
      !!type.trim() ? scenes.filter((scene) => scene._type === type) : scenes
    );
  }, [scenes, type]);

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
        gameObjects={filteredScenes}
        keySelected={Number(value.replace('@s:', ''))}
        title="gameobjectssceneinput"
        typeTarget="scenes"
        showSelectedValue
        onClickRow={handleClickRow}
      />
    </ModalComponent>
  );
};

const DropDownSceneInput = (props: {
  type: string;
  defaultValue?: string[];
  optional?: boolean;
  onChange: (value: string[]) => void;
}) => {
  const { type, defaultValue, optional = false, onChange } = props;
  const { scenes } = useContext(ScenesContext);
  const [sceneOptions, setSceneOptions] = useState<DropdownItemProps[]>([]);
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    } else {
      setValue([]);
    }
  }, [defaultValue]);

  useEffect(() => {
    setSceneOptions(
      (type.trim()
        ? scenes.filter((scene) => scene._type === type)
        : scenes
      ).map((scene) => ({
        text: scene._title,
        value: `@s:${scene._id}`,
        key: `sceneinput-s-${scene._id}`,
      }))
    );
  }, [scenes, type]);

  return (
    <Dropdown
      fluid
      selection
      search
      multiple
      value={value}
      options={Array.from(sceneOptions).reverse()}
      clearable={optional}
      onChange={(_e, data) => {
        setValue(data.value as string[]);
        onChange(data.value as string[]);
      }}
    />
  );
};

const SceneInput: React.FC<
  Omit<CustomInputProps, 'name' | 'onChange'> & {
    type?: string;
    onChange: (value?: string | string[]) => void;
  }
> = (props) => {
  const {
    type = '',
    defaultValue,
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
    }
    if (multiple) {
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
    (nextValue: string) => {
      if (typeof value === 'string') {
        setValue(nextValue);
      } else {
        setValue(value.concat(nextValue));
      }
      setOpenModal(false);

      onChange(nextValue);

      setTimeout(() => onBlur && onBlur(), 500);
    },
    [onBlur, onChange, value]
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    } else if (multiple) {
      setValue([]);
    } else {
      setValue('');
    }
  }, [defaultValue, multiple]);

  if (multiple) {
    return (
      <DropDownSceneInput
        onChange={(nextValue) => onChange(nextValue)}
        type={type}
        optional={optional}
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
      <ModalSceneInput
        open={openModal}
        type={type}
        defaultValue={value as string}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default SceneInput;
