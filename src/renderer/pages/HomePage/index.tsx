import { useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import TranslationPage from '../TranslationPage';

const HomePage = ({ appendTab, id }: any) => {
  return (
    <div>
      Hello world
      <Button onClick={() => appendTab('Translation Module', TranslationPage)}>
        Module translate
      </Button>
    </div>
  );
};
export default HomePage;
