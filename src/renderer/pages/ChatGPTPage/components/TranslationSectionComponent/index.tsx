import { Form } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { Segment } from 'renderer/semantic-ui';
import useChatGPTPage from '../../useChatGPTPage';
import { useEffect, useState } from 'react';

const TranslationSectionComponent: React.FC = () => {
  const { translation, updateChatGPTInfos } = useChatGPTPage();
  const [valueSplit, setValueSplit] = useState<number>(
    translation?.languageFileSplit || 1
  );

  useEffect(() => {
    if (typeof translation?.languageFileSplit !== 'undefined') {
      setValueSplit(translation?.languageFileSplit);
    }
  }, [translation]);

  return (
    <Segment className="game-dev-software-module-application-params-identity-segment">
      <span className="game-dev-software-module-application-params-identity-segment-title">
        {i18n.t('form_input_modal_translations_title')}
      </span>
      <Form>
        <Form.Field>
          <Form.Input
            label={i18n.t('module_chatgpt_form_field_translation_split_label')}
            type={'number'}
            min="1"
            focus
            value={valueSplit}
            onChange={(event) => setValueSplit(Number(event.target.value))}
            onBlur={() => {
              updateChatGPTInfos({
                translation: {
                  languageFileSplit: valueSplit,
                },
              });
            }}
          />
        </Form.Field>
      </Form>
    </Segment>
  );
};

export default TranslationSectionComponent;
