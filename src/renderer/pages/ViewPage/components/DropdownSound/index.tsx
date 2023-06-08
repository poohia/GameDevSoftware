import { useEffect, useState } from 'react';
import { Button } from 'renderer/semantic-ui';
import { Icon } from 'semantic-ui-react';
import useMessages, { useMessagesProps } from '../../useMessages';

const DropdownSound: React.FC<useMessagesProps> = ({ refIframe }) => {
  const [soundActivated, setSoundActivated] = useState<boolean>(false);
  const { sendMessage, listenMessage } = useMessages(refIframe);

  useEffect(() => {
    listenMessage<boolean>('currentSound', (response) => {
      setSoundActivated(response.data);
    });
  }, []);

  return (
    <Button
      icon
      onClick={() => {
        sendMessage('setCurrentSound', !soundActivated);
      }}
      labelPosition="left"
    >
      <Icon name="sound" />
      {soundActivated ? <span>On</span> : <span>Off</span>}
    </Button>
  );
};

export default DropdownSound;
