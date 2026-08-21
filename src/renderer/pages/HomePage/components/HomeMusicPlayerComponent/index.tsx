import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';
import AssetsContext from 'renderer/contexts/AssetsContext';
import { useEvents } from 'renderer/hooks';
import { Button, Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssetType } from 'types';
import { formatBase64 } from 'utils';

const HomeMusicPlayerComponent: React.FC = () => {
  const { assets } = useContext(AssetsContext);
  const { once, sendMessage } = useEvents();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetType>();
  const [source, setSource] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);

  const musicOptions = useMemo(
    () =>
      assets
        .filter((asset) => asset.type === 'sound')
        .map((asset) => ({
          key: asset.name,
          text: asset.name,
          value: asset.name,
        })),
    [assets]
  );

  useEffect(() => {
    if (!selectedAsset) {
      setSource(undefined);
      return;
    }

    setIsPlaying(false);
    once('get-asset-information', (base64: string) => {
      setSource(formatBase64(selectedAsset.type, base64, selectedAsset.name));
    });
    sendMessage('get-asset-information', selectedAsset);
  }, [once, selectedAsset, sendMessage]);

  const play = async () => {
    if (!audioRef.current || !source) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  return (
    <Segment>
      <strong>{i18n.t('home_music_player_title')}</strong>
      <Dropdown
        clearable
        fluid
        placeholder={i18n.t('home_music_player_placeholder')}
        selection
        style={{ marginTop: '0.75rem' }}
        options={musicOptions}
        value={selectedAsset?.name}
        onChange={(_, data) => {
          const name = data.value as string | undefined;
          audioRef.current?.pause();
          setSelectedAsset(assets.find((asset) => asset.name === name));
        }}
      />
      <audio
        ref={audioRef}
        src={source}
        loop={loop}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <Button
          icon
          aria-label={i18n.t('home_music_player_play')}
          disabled={!source || isPlaying}
          onClick={play}
        >
          <Icon name="play" />
        </Button>
        <Button
          icon
          aria-label={i18n.t('home_music_player_pause')}
          disabled={!source || !isPlaying}
          onClick={pause}
        >
          <Icon name="pause" />
        </Button>
        <Button
          icon
          aria-label={i18n.t('home_music_player_loop')}
          active={loop}
          color={loop ? 'violet' : undefined}
          onClick={() => setLoop((value) => !value)}
        >
          <Icon name="repeat" />
        </Button>
      </div>
    </Segment>
  );
};

export default HomeMusicPlayerComponent;
