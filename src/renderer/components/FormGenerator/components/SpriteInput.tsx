import { useCallback, useEffect, useState } from 'react';
import { Checkbox, Grid, Input } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { CustomInputProps } from 'types';
import AssetInput from './AssetInput';
import FieldComponent from './FieldComponent';

const SpriteInput: React.FC<CustomInputProps> = (props) => {
  const { defaultValue, type, onChange, onBlur } = props;
  console.log('🚀 ~ file: SpriteInput.tsx:10 ~ defaultValue', defaultValue);

  const [image, setImage] = useState<string>(defaultValue?.image || '');
  const [width, setWidth] = useState<number | undefined>(defaultValue?.width);
  const [height, setHeight] = useState<number | undefined>(
    defaultValue?.height
  );
  const [maxFrame, setMaxFrame] = useState<number | undefined>(
    defaultValue?.maxFrame
  );
  const [timeBeetweenSprite, setTimeBeetweenSprite] = useState<
    number | undefined
  >(defaultValue?.timeBeetweenSprite);
  const [loop, setLoop] = useState<boolean>(defaultValue?.loop || false);

  const handleSubmit = useCallback(() => {
    if (image && width && height && maxFrame && timeBeetweenSprite) {
      onChange({ image, width, height, maxFrame, timeBeetweenSprite, loop });
    }
  }, [image, width, height, maxFrame, timeBeetweenSprite, loop]);

  useEffect(() => {
    if (image && width && height && maxFrame && timeBeetweenSprite) {
      onChange({ image, width, height, maxFrame, timeBeetweenSprite, loop });
    }
  }, [image, width, height, maxFrame, timeBeetweenSprite, loop]);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_source_image')}>
            <AssetInput
              type="image"
              onChange={(data) => {
                setImage(data);
              }}
              defaultValue={image}
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_width')}>
            <Input
              type="number"
              onChange={(_e, { value }) => {
                if (value === '') {
                  setWidth(undefined);
                  setHeight(undefined);
                } else {
                  setWidth(Number(value));
                  setHeight(Number(value));
                }
              }}
              value={width}
              label="px"
              labelPosition="right"
            />
          </FieldComponent>
        </Grid.Column>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_height')}>
            <Input
              type="number"
              onChange={(_e, { value }) => {
                if (value === '') {
                  setHeight(undefined);
                } else {
                  setHeight(Number(value));
                }
              }}
              value={height}
              label="px"
              labelPosition="right"
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_max_frame')}>
            <Input
              type="number"
              onChange={(_e, { value }) => {
                if (value === '') {
                  setMaxFrame(undefined);
                } else {
                  setMaxFrame(Number(value));
                }
              }}
              value={maxFrame}
            />
          </FieldComponent>
        </Grid.Column>
        <Grid.Column>
          <FieldComponent
            label={i18n.t('form_input_sprite_time_beetween_sprite')}
          >
            <Input
              type="number"
              onChange={(_e, { value }) => {
                if (value === '') {
                  setTimeBeetweenSprite(undefined);
                } else {
                  setTimeBeetweenSprite(Number(value));
                }
              }}
              value={timeBeetweenSprite}
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Column>
        <FieldComponent
          label={i18n.t('form_input_sprite_loop')}
          required={false}
        >
          <Checkbox
            checked={loop}
            label={i18n.t('form_input_sprite_loop_activate')}
            onChange={() => setLoop(!loop)}
          />
        </FieldComponent>
      </Grid.Column>
    </Grid>
  );
};

export default SpriteInput;
