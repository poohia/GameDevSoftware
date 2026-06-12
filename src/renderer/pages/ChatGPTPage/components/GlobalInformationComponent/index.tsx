import { Form, Dropdown } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { TransComponent } from 'renderer/components';
import { Segment } from 'renderer/semantic-ui';
import useChatGPTPage from '../../useChatGPTPage';

const GlobalInformationComponent: React.FC = () => {
  const {
    apiKeyState,
    extraPromptState,
    temperatureState,
    models,
    model,
    setApiKeyState,
    setExtraPromptState,
    setTemperatureState,
    updateChatGPTInfos,
  } = useChatGPTPage();

  return (
    <Segment className="game-dev-software-module-application-params-identity-segment">
      <span className="game-dev-software-module-application-params-identity-segment-title">
        {i18n.t('module_chatgpt_section_global_information')}
      </span>
      <Form>
        <Form.Field>
          <Form.Input
            label={i18n.t('module_chatgpt_form_field_api_key_label')}
            type={'text'}
            focus
            value={apiKeyState}
            onBlur={(event: any) => {
              updateChatGPTInfos({ apiKey: event.target.value });
            }}
            onChange={(event) => setApiKeyState(event.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            label={`${i18n.t(
              'module_chatgpt_form_field_extrat_prompt_label'
            )} (English)`}
            type={'text'}
            focus
            value={extraPromptState}
            onBlur={(event: any) => {
              updateChatGPTInfos({ extraPrompt: event.target.value });
            }}
            onChange={(event) => setExtraPromptState(event.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            label={`${i18n.t(
              'module_chatgpt_form_field_temperature_label'
            )} (0 - 2)`}
            type={'number'}
            min={0}
            max={2}
            step={0.1}
            value={temperatureState}
            onBlur={() => {
              const parsedTemperature = Number(temperatureState);
              const nextTemperature = Number.isFinite(parsedTemperature)
                ? Math.min(2, Math.max(0, parsedTemperature))
                : 1;

              setTemperatureState(String(nextTemperature));
              updateChatGPTInfos({ temperature: nextTemperature });
            }}
            onChange={(event) => setTemperatureState(event.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>
            <TransComponent id="module_chatgpt_form_field_model_label" />
          </label>
          <Dropdown
            fluid
            options={models}
            value={model}
            selection
            search
            onChange={(_event, data) => {
              if (typeof data.value === 'string') {
                updateChatGPTInfos({ model: data.value });
              }
            }}
          />
        </Form.Field>
      </Form>
    </Segment>
  );
};

export default GlobalInformationComponent;
