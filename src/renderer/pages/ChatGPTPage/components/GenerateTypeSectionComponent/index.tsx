import { Form, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { Button, Segment } from 'renderer/semantic-ui';
import useChatGPTPage from '../../useChatGPTPage';
import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';

const GenerateTypeSectionComponent: React.FC = () => {
  const { apiKey, generationType, updateChatGPTInfos } = useChatGPTPage();
  const { once, sendMessage } = useEvents();
  const [loading, setLoading] = useState<boolean>(false);

  const [extraPrompt, setExtraPromptState] = useState<string>(
    generationType?.extraPrompt || ''
  );

  const handleClick = useCallback(() => {
    once('chatgpt-generate-types', () => {
      setLoading(false);
    });
    sendMessage('chatgpt-generate-types');
    setLoading(true);
  }, []);

  useEffect(() => {
    setExtraPromptState(generationType?.extraPrompt || '');
  }, [generationType?.extraPrompt]);

  return (
    <Segment className="game-dev-software-module-application-params-identity-segment">
      <span className="game-dev-software-module-application-params-identity-segment-title">
        {i18n.t('form_input_modal_generatetype_title')}
      </span>
      <Form>
        <Form.Field>
          <Form.Input
            label={i18n.t('module_chatgpt_form_field_extrat_prompt_label')}
            type={'text'}
            focus
            value={extraPrompt}
            onBlur={(_event: any) => {
              updateChatGPTInfos({
                generationType: {
                  extraPrompt,
                },
              });
            }}
            onChange={(event) => {
              setExtraPromptState(event.target.value);
            }}
          />
        </Form.Field>
      </Form>
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
