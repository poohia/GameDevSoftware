import { Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { Button, Segment } from 'renderer/semantic-ui';
import useChatGPTPage from '../../useChatGPTPage';
import { useCallback, useState } from 'react';
import { useEvents } from 'renderer/hooks';

const GenerateTypeSectionComponent: React.FC = () => {
  const { apiKey } = useChatGPTPage();
  const { once, sendMessage } = useEvents();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    once('chatgpt-generate-types', () => {
      setLoading(false);
    });
    sendMessage('chatgpt-generate-types');
    setLoading(true);
  }, []);

  return (
    <Segment className="game-dev-software-module-application-params-identity-segment">
      <span className="game-dev-software-module-application-params-identity-segment-title">
        {i18n.t('form_input_modal_generatetype_title')}
      </span>
      <Button
        icon
        labelPosition="right"
        color="green"
        fluid
        loading={loading}
        onClick={handleClick}
        disabled={!apiKey}
      >
        {i18n.t('form_input_modal_generatetype_cta_all')}
        <Icon name="play" />
      </Button>
    </Segment>
  );
};

export default GenerateTypeSectionComponent;
