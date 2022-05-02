import { Button } from 'semantic-ui-react';
import { PageProps } from 'types';
import i18n, { localeEnable } from 'translations/i18n';
import { useCallback } from 'react';
/** Pages */
import ConstantPage from 'renderer/pages/ConstantPage';
import TranslationPage from 'renderer/pages/TranslationPage';
import AssetPage from 'renderer/pages/AssetPage';
/**  */
import { DropdownLanguagesComponent } from 'renderer/components';
import { useDatabase } from 'renderer/hooks';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  const { setItem } = useDatabase();
  const onChangeLocale = useCallback((locale: string) => {
    setItem('locale', locale);
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
      />
      <br />
      <Button onClick={() => appendTab('module_translation', TranslationPage)}>
        {i18n.t('module_translation')}
      </Button>
      <Button onClick={() => appendTab('module_constant', ConstantPage)}>
        {i18n.t('module_constant')}
      </Button>
      <Button onClick={() => appendTab('module_asset', AssetPage)}>
        {i18n.t('module_asset')}
      </Button>
    </div>
  );
};
export default HomePage;
