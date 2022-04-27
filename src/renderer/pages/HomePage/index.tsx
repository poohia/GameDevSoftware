import { Button } from 'semantic-ui-react';
import { PageProps } from 'types';
import TranslationPage from 'renderer/pages/TranslationPage';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  return (
    <div>
      <Button onClick={() => appendTab('Translation Module', TranslationPage)}>
        Module translate
      </Button>
    </div>
  );
};
export default HomePage;
