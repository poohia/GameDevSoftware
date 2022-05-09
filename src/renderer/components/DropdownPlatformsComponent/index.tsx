import { Dropdown, DropdownProps } from 'semantic-ui-react';
import usePlatformsComponent from './usePlatformsComponent';

const DropdownPlatformsComponent = (props: Omit<DropdownProps, 'options'>) => {
  const { options } = usePlatformsComponent();
  return <Dropdown fluid selection clearable options={options} {...props} />;
};

export default DropdownPlatformsComponent;
