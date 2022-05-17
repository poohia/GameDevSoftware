import { ReactNode } from 'react';
import { Button, Icon, Modal, ModalProps } from 'semantic-ui-react';
import TransComponent from '../TransComponent';

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
}) => (
  <Modal {...rest}>
    <Modal.Header>{title}</Modal.Header>
    <Modal.Content>{children}</Modal.Content>
    <Modal.Actions>
      <Button color="black" onClick={onClose} icon labelPosition="left">
        <TransComponent id="modal_component_btn_close" />
        <Icon name="close" />
      </Button>
      <Button
        labelPosition="right"
        icon
        disabled={disableAccepted}
        onClick={onAccepted}
        color="green"
      >
        <TransComponent id="modal_component_btn_accepted" />
        <Icon name="checkmark" />
      </Button>
    </Modal.Actions>
  </Modal>
);

export default ModalComponent;
