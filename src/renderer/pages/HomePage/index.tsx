import { Button } from 'semantic-ui-react';
import { PageProps } from 'types';
import TranslationPage from 'renderer/pages/TranslationPage';
import i18n from 'translations/i18n';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  return (
    <div>
      <Button onClick={() => appendTab('Translation Module', TranslationPage)}>
        {i18n.t('moduletranslation')}
      </Button>
    </div>
  );
};
export default HomePage;
