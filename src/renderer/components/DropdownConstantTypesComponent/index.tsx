import { Dropdown, DropdownProps } from 'semantic-ui-react';

const typesOptions = [
  { text: 'String', value: 'string', key: 'string' },
  { text: 'Number', value: 'number', key: 'number' },
  { text: 'Array of string', value: 'string[]', key: 'string[]' },
  { text: 'Array of number', value: 'number[]', key: 'json' },
];

type DropdownAssetTypesComponentProps = Omit<DropdownProps, 'options'> & {};

const DropdownConstantTypesComponent = (
  props: DropdownAssetTypesComponentProps
) => {
  return <Dropdown fluid selection search options={typesOptions} {...props} />;
};

export default DropdownConstantTypesComponent;
