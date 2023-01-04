import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import TransComponent from 'renderer/components/TransComponent';
import TranslationsContext from 'renderer/contexts/TranslationsContext';
import { TranslationTableComponent } from 'renderer/pages/TranslationPage/components';
import { ModalProps } from 'semantic-ui-react';
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
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onSubmit(value)}
      title={<TransComponent id="form_input_modal_translations_title" />}
      closeOnDimmerClick
      dimmer={'inverted'}
      disableAccepted={value === ''}
      {...rest}
    >
      <TranslationTableComponent
        canDelete={false}
        locale={'en'}
        onClickRow={handleClickRow}
        onDelete={() => {}}
        translations={translations}
        keySelected={value.replace('@t:', '')}
      />
    </ModalComponent>
  );
};

const TranslationInput = (props: CustomInputProps) => {
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
      <ModalTranslation
        open={openModal}
        defaultValue={defaultValue}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
      <input type="hidden" name={name} ref={inputRef} />
    </>
  );
};

export default TranslationInput;
