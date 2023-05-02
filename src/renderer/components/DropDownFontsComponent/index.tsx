import { useEffect, useMemo, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Button } from 'renderer/semantic-ui';
import { Dropdown, DropdownProps, Grid, Icon } from 'semantic-ui-react';
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
const defaultFonts = [
  'cursive',
  'emoji',
  'fangsong',
  'fantasy',
  'math',
  'monospace',
  'sans-serif',
  'serif',
  'system-ui',
];
const DropDownFontsComponent: React.FC<DropdownLanguagesComponentProps> = (
  props
) => {
  const { value, onChange, ...rest } = props;
  const [fonts, setFonts] = useState<string[]>([]);

  const { requestMessage, sendMessage } = useEvents();

  const defaultValue = useMemo(() => fonts[0], [fonts]);
  const finalValue = useMemo(
    () => value ?? defaultValue,
    [defaultValue, value]
  );

  useEffect(() => {
    requestMessage('load-fonts', (data) => {
      setFonts(data);
    });
  }, []);

  useEffect(() => {
    if (value === undefined && onChange) {
      // @ts-ignore
      onChange(null, { value: finalValue });
    }
  }, [value, finalValue]);

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={14}>
          <Dropdown
            {...rest}
            search
            fluid
            selection
            defaultValue={defaultValue}
            value={finalValue}
            options={[...fonts, ...defaultFonts].map((font) => ({
              text: font,
              value: font,
              key: font,
            }))}
            onChange={onChange}
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Button
            icon
            color="red"
            disabled={finalValue ? !fonts.includes(finalValue as string) : true}
            onClick={() => sendMessage('remove-font', finalValue)}
          >
            <Icon name="trash" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default DropDownFontsComponent;
