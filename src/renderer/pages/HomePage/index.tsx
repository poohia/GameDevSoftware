import { Button } from 'semantic-ui-react';
import { PageProps } from 'types';
import TranslationPage from 'renderer/pages/TranslationPage';
import i18n, { localeEnable } from 'translations/i18n';
import { DropdownLanguagesComponent } from 'renderer/components';
import { useCallback } from 'react';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  const onChangeLocale = useCallback((locale: string) => {
    localStorage.setItem('locale', locale);
    location.reload();
  }, []);
  return (
    <div>
      <DropdownLanguagesComponent
        placeholder="Select Country"
        fluid
        selection
        search
        value={i18n.locale}
        options={localeEnable.map((language) => ({
          key: language,
          value: language,
          flag: language === 'en' ? 'gb eng' : language,
          text: language,
        }))}
        onChange={(_, { value }) => onChangeLocale(value as string)}
        languagesFilters={[]}
      />
      <br />
      <Button onClick={() => appendTab('Translation Module', TranslationPage)}>
        {i18n.t('moduletranslation')}
      </Button>
    </div>
  );
};
export default HomePage;
