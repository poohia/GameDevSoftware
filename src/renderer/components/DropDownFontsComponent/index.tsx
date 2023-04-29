import { useState } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import i18n from 'translations/i18n';

type DefaultFonts =
  | 'cursive'
  | 'emoji'
  | 'fangsong'
  | 'fantasy'
  | 'math'
  | 'monospace'
  | 'sans-serif'
  | 'serif'
  | 'system-ui'
  | 'ui-monospace'
  | 'ui-rounded'
  | 'ui-sans-serif'
  | 'ui-serif';

type DropdownLanguagesComponentProps = DropdownProps;

const DropDownFontsComponent: React.FC<DropdownLanguagesComponentProps> = (
  props
) => {
  const [fonts, setFonts] = useState<string[]>([
    'cursive',
    'emoji',
    'fangsong',
    'fantasy',
    'math',
    'monospace',
    'sans-serif',
    'serif',
    'system-ui',
  ]);
  const [value, setValue] = useState<string>('sans-serif');

  return (
    <Dropdown
      {...props}
      search
      fluid
      selection
      options={fonts.map((font) => ({
        text: font,
        value: font,
        key: font,
      }))}
      // value={value}
    />
  );
};

export default DropDownFontsComponent;
