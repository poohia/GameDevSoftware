import {
  Container,
  Grid,
  Header,
  Modal,
  ModalContent,
  ModalDescription,
} from 'semantic-ui-react';
import i18n from 'translations/i18n';
import {
  TranslationTableComponent,
  TranslationHeaderComponent,
  TranslationFormComponent,
} from './components';
import useTranslationPage from './useTranslationPage';
import { Segment } from 'renderer/semantic-ui';
import { TransComponent } from 'renderer/components';

const TranslationPage = () => {
  const {
    module,
    currentTranslations,
    locale,
    languages,
    translationForm,
    isModuleView,
    showModalCreationNewLanguage,
    appendLocale,
    changeGameCurrentLocale,
    deleteTranslation,
    removeLocale,
    createTranslationKey,
    updateTranslationKey,
    appendTranslation,
  } = useTranslationPage();
  return (
    <Container fluid>
      <Grid divided columns={2}>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_translation')}</Header>
            </Grid.Row>
            {!isModuleView && (
              <Grid.Row>
                <TranslationHeaderComponent
                  locale={locale}
                  languages={languages}
                  onChangeLocale={changeGameCurrentLocale}
                  onAppendLocale={appendLocale}
                  onRemoveLocale={removeLocale}
                  onAppendTranslation={createTranslationKey}
                />
              </Grid.Row>
            )}
            <Grid.Row>
              {currentTranslations && (
                <TranslationTableComponent
                  translations={currentTranslations}
                  locale={locale}
                  keySelected={translationForm?.keyTranslation}
                  module={module}
                  onClickRow={updateTranslationKey}
                  onDelete={deleteTranslation}
                />
              )}
            </Grid.Row>
          </Grid.Column>
          {translationForm && (
            <Grid.Column width={8}>
              <TranslationFormComponent
                {...translationForm}
                gameLocale={locale}
                onSubmit={appendTranslation}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
      <Modal open={showModalCreationNewLanguage}>
        <ModalContent>
          <Segment>
            <TransComponent id="module_chatgpt_creating_translate_file" />
          </Segment>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default TranslationPage;
