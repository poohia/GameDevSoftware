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

type DropdownLanguagesComponentProps = DropdownProps & {
  forceFirstValue?: boolean;
  canDelete?: boolean;
};
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
  const {
    value: valueProps,
    defaultValue: defaultValueProps,
    forceFirstValue = false,
    canDelete = false,
    onChange,
    ...rest
  } = props;
  const [value, setValue] = useState<DropdownProps['value']>(valueProps);
  const [fonts, setFonts] = useState<string[]>([]);

  const { requestMessage, sendMessage } = useEvents();

  const defaultValue = useMemo(() => {
    if (valueProps) {
      return valueProps;
    }
    if (defaultValueProps) {
      return defaultValueProps;
    }
    if (forceFirstValue) {
      return fonts[0];
    }
    return;
  }, [fonts]);
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
    if (onChange) {
      //@ts-ignore
      onChange(null, { value: finalValue });
    }
  }, [finalValue, onChange]);

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={canDelete ? 15 : 16}>
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
            // onChange={onChange}
            onChange={(_e, data) => setValue(data.value)}
          />
        </Grid.Column>
        {canDelete && (
          <Grid.Column width={1}>
            <Button
              icon
              color="red"
              disabled={
                finalValue ? !fonts.includes(finalValue as string) : true
              }
              onClick={() => {
                sendMessage('remove-font', finalValue);
                // @ts-ignore
                onChange(null, { value: undefined });
              }}
            >
              <Icon name="trash" />
            </Button>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default DropDownFontsComponent;
