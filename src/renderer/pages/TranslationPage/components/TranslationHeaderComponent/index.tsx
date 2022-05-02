import { useState } from 'react';
import { DropdownLanguagesComponent } from 'renderer/components';
import { Button, Grid, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';

type TranslationHeaderComponentProps = {
  locale: string;
  languages: string[];
  onChangeLocale: (locale: string) => void;
  onAppendLocale: (locale: string) => void;
  onRemoveLocale: (locale: string) => void;
  onAppendTranslation: () => void;
};
const TranslationHeaderComponent = (props: TranslationHeaderComponentProps) => {
  const {
    locale,
    languages,
    onChangeLocale,
    onAppendLocale,
    onRemoveLocale,
    onAppendTranslation,
  } = props;
  const [value, setValue] = useState<string | null>(null);
  return (
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column width={13}>
                <DropdownLanguagesComponent
                  placeholder="Select Country"
                  fluid
                  selection
                  search
                  value={locale}
                  options={languages.map((language) => ({
                    key: language,
                    value: language,
                    flag: language === 'en' ? 'gb eng' : language,
                    text: language,
                  }))}
                  onChange={(_, { value }) => onChangeLocale(value as string)}
                />
              </Grid.Column>
              <Grid.Column width={3}>
                <Button
                  icon
                  disabled={languages.length === 1}
                  onClick={() => onRemoveLocale(locale)}
                  color="red"
                >
                  <Icon name="trash" />
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
        <Grid.Column>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column width={13}>
                <DropdownLanguagesComponent
                  languagesFilters={languages || []}
                  onChange={(_, { value }) => setValue(value as string)}
                  placeholder={i18n.t(
                    'dropdown_languages_placeholder_append_country'
                  )}
                  clearable
                />
              </Grid.Column>
              <Grid.Column width={3}>
                <Button
                  icon
                  onClick={() => value !== null && onAppendLocale(value)}
                >
                  <Icon name="add" />
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
        <Grid.Column>
          <Button
            color="green"
            icon
            labelPosition="right"
            onClick={() => onAppendTranslation()}
          >
            {i18n.t('module_translation_header_button_append_translation')}
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default TranslationHeaderComponent;
