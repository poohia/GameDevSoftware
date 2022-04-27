import { useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div>
      Hello world
      <Button onClick={() => navigate('/module/translate')}>
        Module translate
      </Button>
    </div>
  );
};
export default HomePage;
