import { useCallback, useContext, useEffect, useRef } from 'react';
import TerminalContext from '../../contexts/TerminalContext';
import ModalComponent from '../ModalComponent';
import TransComponent from '../TransComponent';

const TerminalComponent: React.FC = () => {
  const { openTerminal, messages, setOpenTerminal, clearMessages } =
    useContext(TerminalContext);
  const divContainer = useRef<HTMLDivElement>(null);

  const scrollDiv = useCallback(() => {
    setTimeout(() => {
      if (divContainer.current) {
        divContainer.current.scrollTop = divContainer.current.scrollHeight;
      }
    }, 100);
  }, [divContainer]);

  useEffect(() => {
    scrollDiv();
  }, [divContainer, messages]);

  useEffect(() => {
    scrollDiv();
  }, [openTerminal]);

  return (
    <ModalComponent
      open={openTerminal}
      onAccepted={() => {
        clearMessages();
      }}
      onClose={() => {
        setOpenTerminal(false);
      }}
      title={<TransComponent id="terminal_component_modal_title" />}
    >
      <div ref={divContainer} className="game-dev-software-terminal">
        {messages.join('\n')}
      </div>
    </ModalComponent>
  );
};

export default TerminalComponent;
