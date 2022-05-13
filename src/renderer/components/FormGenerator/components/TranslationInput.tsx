import { useCallback, useContext, useEffect, useState } from 'react';
import TranslationsContext from 'renderer/contexts/TranslationsContext';
import { TranslationTableComponent } from 'renderer/pages/TranslationPage/components';
import { Button, Modal, ModalProps } from 'semantic-ui-react';
import { CustomInputProps } from 'types';

const ModalTranslation = (
  props: ModalProps & {
    defaultValue?: string;
    onSubmit: (value: string) => void;
  }
) => {
  const { open, defaultValue, onClose, onSubmit, ...rest } = props;
  const { translations } = useContext(TranslationsContext);
  const [value, setValue] = useState<string>('');
  const handleClickRow = useCallback(
    (key: string) => {
      setValue(`@t:${key}`);
    },
    [translations]
  );
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.replace('@t:', ''));
    }
  }, [defaultValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnDimmerClick
      dimmer={'inverted'}
      {...rest}
    >
      <Modal.Header>Translations</Modal.Header>
      <Modal.Content>
        <TranslationTableComponent
          canDelete={false}
          locale={'en'}
          onClickRow={handleClickRow}
          onDelete={() => {}}
          translations={translations}
          keySelected={value.replace('@t:', '')}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={onClose}>
          Nope
        </Button>
        <Button
          content="Yep, that's me"
          labelPosition="right"
          icon="checkmark"
          positive
          disabled={value === ''}
          onClick={() => onSubmit(value)}
        />
      </Modal.Actions>
    </Modal>
  );
};

const TranslationInput = (props: CustomInputProps) => {
  const { defaultValue, onChange } = props;
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
      <ModalTranslation
        open={openModal}
        defaultValue={defaultValue}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default TranslationInput;
