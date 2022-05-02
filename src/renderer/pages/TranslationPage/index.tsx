import { Container, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import {
  TranslationTableComponent,
  TranslationHeaderComponent,
  TranslationFormComponent,
} from './components';
import useTranslationPage from './useTranslationPage';

const TranslationPage = () => {
  const {
    currentTranslations,
    locale,
    languages,
    translationForm,
    appendLocale,
    setLocale,
    deleteTranslation,
    removeLocale,
    createTranslationKey,
    updateTranslationKey,
    appendTranslation,
  } = useTranslationPage();

  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">{i18n.t('module_translation')}</Header>
            </Grid.Row>
            <Grid.Row>
              <TranslationHeaderComponent
                locale={locale}
                languages={languages}
                onChangeLocale={(locale) => setLocale(locale)}
                onAppendLocale={appendLocale}
                onRemoveLocale={removeLocale}
                onAppendTranslation={createTranslationKey}
              />
            </Grid.Row>
            <Grid.Row>
              <TranslationTableComponent
                translations={currentTranslations}
                locale={locale}
                onClickRow={updateTranslationKey}
                onDelete={deleteTranslation}
              />
            </Grid.Row>
          </Grid.Column>
          {translationForm && (
            <Grid.Column width={8}>
              <TranslationFormComponent
                {...translationForm}
                onSubmit={appendTranslation}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default TranslationPage;
