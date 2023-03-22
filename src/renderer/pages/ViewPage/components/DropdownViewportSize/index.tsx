import { useEffect, useState } from 'react';
import { useDatabase } from 'renderer/hooks';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

const typesViewportSize: DropdownItemProps[] = [
  { text: 'iPhone SE', value: 'iphoneSE', key: 'iphoneSe' },
  { text: 'Pixel 5', value: 'pixel5', key: 'pixel5' },
  { text: 'iPhone XR', value: 'iphoneXR', key: 'iphoneXR' },
  { text: 'iPad Mini', value: 'ipadMini', key: 'ipadMini' },
  { text: 'iPad Air', value: 'ipadAir', key: 'ipadAir' },
  { text: 'Full', value: 'full', key: 'full' },
];

type DropdownViewportSizeProps = {
  onChange: (width: string, height: string) => void;
};

const DropdownViewportSize: React.FC<DropdownViewportSizeProps> = ({
  onChange,
}) => {
  const { setItem, getItem } = useDatabase();
  const [value, setValue] = useState<string>(() => {
    const v = getItem('dropdown.viewportsize');
    return v || 'ipadMini';
  });

  useEffect(() => {
    switch (value) {
      case 'iphoneSE':
        onChange('667px', '375px');
        break;
      case 'pixel5':
        onChange('851px', '393px');
        break;
      case 'iphoneXR':
        onChange('896px', '424px');
        break;
      case 'ipadMini':
        onChange('1024px', '768px');
        break;
      case 'ipadAir':
        onChange('1180px', '820px');
        break;
      case 'full':
      default:
        onChange('100%', '100%');
    }
    setItem('dropdown.viewportsize', value);
  }, [value]);

  return (
    <Dropdown
      selection
      options={typesViewportSize}
      value={value}
      onChange={(_, data) => setValue((data.value as string) || 'full')}
    />
  );
};

export default DropdownViewportSize;
