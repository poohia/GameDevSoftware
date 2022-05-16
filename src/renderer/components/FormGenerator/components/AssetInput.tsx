import { useCallback, useContext, useEffect, useState } from 'react';
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
      closeOnDimmerClick
      dimmer={'inverted'}
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
  const { defaultValue, type, onChange } = props;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

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
      onChange(value);
    },
    [value]
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
      <ModalAsset
        open={openModal}
        defaultValue={defaultValue}
        type={type as AssertAcceptedType}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AssetInput;
