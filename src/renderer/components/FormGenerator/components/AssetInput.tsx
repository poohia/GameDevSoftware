import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import AssetsContext from 'renderer/contexts/AssetsContext';
import { AssetTableComponent } from 'renderer/pages/AssetPage/components';
import { ModalProps } from 'semantic-ui-react';
import { AssertAcceptedType, CustomInputProps } from 'types';

const ModalAsset = (
  props: ModalProps & {
    type: AssertAcceptedType;
    defaultValue?: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
  }
) => {
  const { open, defaultValue, type, onClose, onSubmit, ...rest } = props;
  const { assets } = useContext(AssetsContext);
  const [value, setValue] = useState<string>('');
  const handleClickRow = useCallback(
    (key: string) => {
      setValue(`@a:${key}`);
    },
    [assets]
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
      title={<TransComponent id="form_input_modal_assets_title" />}
      disableAccepted={value === ''}
      {...rest}
    >
      <AssetTableComponent
        onClickRow={({ name }) => handleClickRow(name)}
        onDelete={() => {}}
        canDelete={false}
        assets={assets}
        keySelected={value.replace('@a:', '')}
        defaultFilterType={type}
      />
    </ModalComponent>
  );
};

const AssetInput = (props: CustomInputProps) => {
  const {
    defaultValue = '',
    type,
    name,
    multiple,
    clearable,
    onChange,
    onBlur,
  } = props;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [value, setValue] = useState<string>(defaultValue);
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
    setValue(defaultValue);
  }, [defaultValue]);

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
      <ModalAsset
        open={openModal}
        defaultValue={value}
        type={type as AssertAcceptedType}
        multiple={multiple}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
      <input type="hidden" name={name} ref={inputRef} />
    </>
  );
};

export default AssetInput;
