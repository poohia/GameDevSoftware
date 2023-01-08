import { useCallback, useEffect, useState } from 'react';
import SpriteComponent, {
  SpriteComponentProps,
} from 'renderer/components/SpriteComponent/SpriteComponent';
import { useEvents } from 'renderer/hooks';
import { Button } from 'renderer/semantic-ui';
import { Checkbox, Grid, Input } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { CustomInputProps } from 'types';
import AssetInput from './AssetInput';
import BooleanInput from './BooleanInput';
import FieldComponent from './FieldComponent';
import InputComponent from './InputComponent';

const SpriteInput: React.FC<
  Omit<CustomInputProps, 'onChange' | 'name'> & {
    onChange: (sprite: SpriteComponentProps) => void;
  }
> = (props) => {
  const { defaultValue, onChange } = props;
  const { sendMessage, once } = useEvents();

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
  const [spriteProps, setSpriteProps] = useState<SpriteComponentProps | null>(
    null
  );

  useEffect(() => {
    setImage(defaultValue?.image || '');
    setWidth(defaultValue?.width);
    setHeight(defaultValue?.height);
    setMaxFrame(defaultValue?.maxFrame);
    setTimeBeetweenSprite(defaultValue?.timeBeetweenSprite);
    setLoop(defaultValue?.loop);
    setSpriteProps(null);
  }, [defaultValue]);

  const toggleAnimationHandle = useCallback(() => {
    if (
      image !== '' &&
      width &&
      height &&
      maxFrame &&
      timeBeetweenSprite &&
      !spriteProps
    ) {
      sendMessage('load-asset-base64', image.replace('@a:', ''));
      once('get-asset-information', (data) => {
        setSpriteProps({
          image: `data:image/png;base64,${data}`,
          maxFrame,
          timeBeetweenSprite,
          width,
          height,
          loop,
        });
      });
    } else {
      setSpriteProps(null);
    }
  }, [image, width, height, maxFrame, timeBeetweenSprite, loop, spriteProps]);

  useEffect(() => {
    setSpriteProps(null);
    if (image !== '' && width && height && maxFrame && timeBeetweenSprite) {
      onChange({ image, width, height, maxFrame, timeBeetweenSprite, loop });
    }
  }, [image, width, height, maxFrame, timeBeetweenSprite, loop]);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_source_image')}>
            <AssetInput
              name="unknow"
              type="image"
              onChange={(e) => {
                setImage(e.target.value);
              }}
              defaultValue={image}
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_width')}>
            <InputComponent
              type="number"
              onChange={(e) => {
                const { value } = e.target;
                if (value === '') {
                  setWidth(undefined);
                  setHeight(undefined);
                } else {
                  setWidth(Number(value));
                  setHeight(Number(value));
                }
              }}
              defaultValue={width}
              value={width}
              label="px"
              labelPosition="right"
              hideConstant
            />
          </FieldComponent>
        </Grid.Column>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_height')}>
            <InputComponent
              type="number"
              onChange={(e) => {
                const { value } = e.target;
                if (value === '') {
                  setHeight(undefined);
                } else {
                  setHeight(Number(value));
                }
              }}
              value={height}
              label="px"
              labelPosition="right"
              hideConstant
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <FieldComponent label={i18n.t('form_input_sprite_max_frame')}>
            <InputComponent
              type="number"
              onChange={(e) => {
                const { value } = e.target;
                if (value === '') {
                  setMaxFrame(undefined);
                } else {
                  setMaxFrame(Number(value));
                }
              }}
              value={maxFrame}
              hideConstant
            />
          </FieldComponent>
        </Grid.Column>
        <Grid.Column>
          <FieldComponent
            label={i18n.t('form_input_sprite_time_beetween_sprite')}
          >
            <InputComponent
              type="number"
              onChange={(e) => {
                const { value } = e.target;
                if (value === '') {
                  setTimeBeetweenSprite(undefined);
                } else {
                  setTimeBeetweenSprite(Number(value));
                }
              }}
              value={timeBeetweenSprite}
              hideConstant
            />
          </FieldComponent>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <FieldComponent
            label={i18n.t('form_input_sprite_loop')}
            required={false}
          >
            <BooleanInput
              defaultValue={loop}
              label={i18n.t('form_input_sprite_loop_activate')}
              onChange={() => setLoop(!loop)}
            />
          </FieldComponent>
        </Grid.Column>
        <Grid.Column>
          <Button
            onClick={toggleAnimationHandle}
            type="button"
            disabled={
              !(
                image !== '' &&
                width &&
                height &&
                maxFrame &&
                timeBeetweenSprite
              )
            }
          >
            Show Animation
          </Button>
        </Grid.Column>
      </Grid.Row>
      {spriteProps && (
        <Grid.Row>
          <SpriteComponent {...spriteProps} />
        </Grid.Row>
      )}
    </Grid>
  );
};

export default SpriteInput;
