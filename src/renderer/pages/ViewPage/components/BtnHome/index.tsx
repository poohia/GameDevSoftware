import { Button } from 'renderer/semantic-ui';
import useMessages, { useMessagesProps } from '../../useMessages';

const BtnHome: React.FC<useMessagesProps> = ({ refIframe }) => {
  const { sendMessage } = useMessages(refIframe);
  return (
    <Button color={'olive'} onClick={() => sendMessage('goHome')}>
      Home
    </Button>
  );
};

export default BtnHome;
