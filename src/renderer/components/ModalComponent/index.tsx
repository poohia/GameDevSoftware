import { ReactNode, useContext } from 'react';
import { Icon, Modal, ModalProps } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import TransComponent from '../TransComponent';
import DarkModeContext from 'renderer/contexts/DarkModeContext';

type ModalComponentProps = ModalProps & {
  title: ReactNode;
  children: ReactNode;
  disableAccepted?: boolean;
  onClose: () => void;
  onAccepted: () => void;
};

const ModalComponent: React.FunctionComponent<ModalComponentProps> = ({
  title,
  children,
  disableAccepted,
  onClose,
  onAccepted,
  ...rest
}) => {
  const { darkModeActived } = useContext(DarkModeContext);

  return (
    <Modal
      closeOnDimmerClick
      closeOnDocumentClick
      dimmer={darkModeActived}
      onClose={() => onClose()}
      {...rest}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>{children}</Modal.Content>
      <Modal.Actions>
        <Button
          color="black"
          onClick={onClose}
          icon
          labelPosition="left"
          inverted={false}
        >
          <TransComponent id="modal_component_btn_close" />
          <Icon name="close" />
        </Button>
        <Button
          labelPosition="right"
          icon
          disabled={disableAccepted}
          onClick={onAccepted}
          color="green"
          inverted={false}
        >
          <TransComponent id="modal_component_btn_accepted" />
          <Icon name="checkmark" />
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ModalComponent;
