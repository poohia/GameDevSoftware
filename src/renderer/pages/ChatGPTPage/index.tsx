import { Container, Grid, Header, Form, Dropdown } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import useChatGPTPage from './useChatGPTPage';
import { TransComponent } from 'renderer/components';
import { Segment } from 'renderer/semantic-ui';

const ChatGPTPage: React.FC = () => {
  const {
    apiKeyState,
    extratPromptState,
    models,
    model,
    setApiKeyState,
    setExtratPromptState,
    updateApiKey,
    updateModel,
    updateExtratPrompt,
  } = useChatGPTPage();
  return (
    <Container fluid>
      <Grid columns={2} divided>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_chatgpt')}</Header>
            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Container>
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
                        updateApiKey(event.target.value);
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
                      value={extratPromptState}
                      onBlur={(event: any) => {
                        updateExtratPrompt(event.target.value);
                      }}
                      onChange={(event) =>
                        setExtratPromptState(event.target.value)
                      }
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
                          updateModel(data.value);
                        }
                      }}
                    />
                  </Form.Field>
                </Form>
              </Segment>
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ChatGPTPage;
