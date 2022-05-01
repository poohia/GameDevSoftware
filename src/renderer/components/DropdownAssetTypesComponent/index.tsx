import { Dropdown, DropdownProps } from 'semantic-ui-react';

const typesOptions = [
  { text: 'Image', value: 'image', key: 'image' },
  { text: 'Video', value: 'video', key: 'video' },
  { text: 'Sound', value: 'sound', key: 'sound' },
  { text: 'JSON File', value: 'json', key: 'json' },
];

type DropdownAssetTypesComponentProps = Omit<DropdownProps, 'options'> & {};

const DropdownAssetTypesComponent = (
  props: DropdownAssetTypesComponentProps
) => {
  const { defaultValue = 'image', ...rest } = props;
  return (
    <Dropdown
      fluid
      selection
      search
      options={typesOptions}
      defaultValue={defaultValue}
      {...rest}
    />
  );
};

export default DropdownAssetTypesComponent;
