import useMessages, { useMessagesProps } from '../../useMessages';
import { Dropdown } from 'semantic-ui-react';
import { TransComponent } from 'renderer/components';

const BtnGoTo: React.FC<useMessagesProps> = ({ refIframe }) => {
  const { sendMessage } = useMessages(refIframe);
  return (
    <Dropdown
      button
      fluid
      placeholder={<TransComponent id="module_view_go_to" />}
      value={''}
      options={[
        {
          value: 'home',
          text: 'Home',
        },
        {
          value: 'demo',
          text: 'Demo',
        },
        {
          value: 'credits',
          text: 'Credits',
        },
      ]}
      style={{ width: '110px' }}
      onChange={(_, data) => {
        console.log('🚀 ~ BtnGoTo ~ data:', data);
        if (data.value === 'home') {
          sendMessage('goHome');
        } else if (data.value === 'demo') {
          sendMessage('goDemo');
        } else if (data.value === 'credits') {
          sendMessage('goCredits');
        }
      }}
    />
  );
};

export default BtnGoTo;
