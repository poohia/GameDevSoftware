import { Container, Grid, Header, Form, Dropdown } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import useChatGPTPage from './useChatGPTPage';
import { TransComponent } from 'renderer/components';
import { Segment } from 'renderer/semantic-ui';
import GlobalInformationComponent from './components/GlobalInformationComponent';
import TranslationSectionComponent from './components/TranslationSectionComponent';

const ChatGPTPage: React.FC = () => {
  // const {
  //   apiKeyState,
  //   extraPromptState,
  //   models,
  //   model,
  //   setApiKeyState,
  //   setExtraPromptState,
  //   updateApiKey,
  //   updateModel,
  //   updateExtraPrompt,
  // } = useChatGPTPage();
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
              <GlobalInformationComponent />
            </Container>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Container>
              <TranslationSectionComponent />
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ChatGPTPage;
