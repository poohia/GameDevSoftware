import { useEffect, useState } from 'react';
import { useDatabase } from 'renderer/hooks';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

const typesViewportSize: DropdownItemProps[] = [
  { text: 'iPhone SE', value: 'iphoneSE', key: 'iphoneSe' },
  { text: 'One plus 8t', value: 'oneplus8t', key: 'oneplus8t' },
  { text: 'Pixel 5', value: 'pixel5', key: 'pixel5' },
  { text: 'iPhone XR', value: 'iphoneXR', key: 'iphoneXR' },
  { text: 'iPad Mini', value: 'ipadMini', key: 'ipadMini' },
  { text: 'iPad Air', value: 'ipadAir', key: 'ipadAir' },
  { text: 'Full', value: 'full', key: 'full' },
];

type DropdownViewportSizeProps = {
  orientation: 'landscape' | 'portrait';
  onChange: (width: string, height: string) => void;
};

const DropdownViewportSize: React.FC<DropdownViewportSizeProps> = ({
  orientation,
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
        orientation === 'landscape'
          ? onChange('667px', '375px')
          : onChange('375px', '667px');
        break;
      case 'oneplus8t':
        orientation === 'landscape'
          ? onChange('800px', '360px')
          : onChange('360px', '800px');
        break;
      case 'pixel5':
        orientation === 'landscape'
          ? onChange('851px', '393px')
          : onChange('393px', '851px');
        break;
      case 'iphoneXR':
        orientation === 'landscape'
          ? onChange('896px', '424px')
          : onChange('424px', '896px');
        break;
      case 'ipadMini':
        orientation === 'landscape'
          ? onChange('1024px', '768px')
          : onChange('768px', '1024px');
        break;
      case 'ipadAir':
        orientation === 'landscape'
          ? onChange('1180px', '820px')
          : onChange('820px', '1180px');
        break;
      case 'full':
      default:
        onChange('100%', '76vh');
    }
    setItem('dropdown.viewportsize', value);
  }, [value, orientation]);

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
