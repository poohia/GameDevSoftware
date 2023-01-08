import { useContext } from 'react';
import DarkModeContext from 'renderer/contexts/DarkModeContext';
import { Button as ButtonSemantic, ButtonProps } from 'semantic-ui-react';

const Button = (props: ButtonProps) => {
  const { darkModeActived } = useContext(DarkModeContext);
  return <ButtonSemantic inverted={darkModeActived} {...props} />;
};

export default Button;
