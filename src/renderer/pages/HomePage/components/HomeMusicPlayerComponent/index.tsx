import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';
import AssetsContext from 'renderer/contexts/AssetsContext';
import { useDatabase, useEvents } from 'renderer/hooks';
import { Button, Segment } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssetType } from 'types';
import { formatBase64 } from 'utils';

const HomeMusicPlayerComponent: React.FC = () => {
  const { assets } = useContext(AssetsContext);
  const { once, sendMessage } = useEvents();
  const { getItem, setItem } = useDatabase();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetType>();
  const [source, setSource] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [hasRestoredSelection, setHasRestoredSelection] = useState(false);
  const [hasRestoredLoop, setHasRestoredLoop] = useState(false);
  const [shouldResumePlayback, setShouldResumePlayback] = useState(false);
  const [hasRestoredPlayback, setHasRestoredPlayback] = useState(false);

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
    if (hasRestoredSelection || assets.length === 0) return;

    const lastMusicName = getItem<string>('home-music-player-last-asset');
    const lastMusic = assets.find(
      (asset) => asset.type === 'sound' && asset.name === lastMusicName
    );

    if (lastMusic) {
      setSelectedAsset(lastMusic);
    }
    setHasRestoredSelection(true);
  }, [assets, getItem, hasRestoredSelection]);

  useEffect(() => {
    if (hasRestoredLoop) return;

    setLoop(getItem<boolean>('home-music-player-loop') || false);
    setHasRestoredLoop(true);
  }, [getItem, hasRestoredLoop]);

  useEffect(() => {
    if (hasRestoredPlayback) return;

    setShouldResumePlayback(
      getItem<boolean>('home-music-player-is-playing') || false
    );
    setHasRestoredPlayback(true);
  }, [getItem, hasRestoredPlayback]);

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

  const play = useCallback(async () => {
    if (!audioRef.current || !source) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [source]);

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const pauseMusic = () => pause();
    window.addEventListener('home-music-player-pause', pauseMusic);
    return () => {
      window.removeEventListener('home-music-player-pause', pauseMusic);
    };
  }, []);

  const notifyPlayingState = (isPlaying: boolean) => {
    window.dispatchEvent(
      new CustomEvent<boolean>('home-music-player-playing-change', {
        detail: isPlaying,
      })
    );
  };

  useEffect(() => {
    if (!source || !shouldResumePlayback || !audioRef.current) return;

    play();
    setShouldResumePlayback(false);
  }, [play, shouldResumePlayback, source]);

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
          const nextAsset = assets.find(
            (asset) => asset.type === 'sound' && asset.name === name
          );
          audioRef.current?.pause();
          setItem('home-music-player-last-asset', nextAsset?.name || '');
          setSelectedAsset(nextAsset);
        }}
      />
      <audio
        ref={audioRef}
        src={source}
        loop={loop}
        onEnded={() => {
          setIsPlaying(false);
          setItem('home-music-player-is-playing', false);
          notifyPlayingState(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setItem('home-music-player-is-playing', false);
          notifyPlayingState(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setItem('home-music-player-is-playing', true);
          notifyPlayingState(true);
        }}
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
          onClick={() => {
            const nextLoop = !loop;
            setLoop(nextLoop);
            setItem('home-music-player-loop', nextLoop);
          }}
        >
          <Icon name="repeat" />
        </Button>
      </div>
    </Segment>
  );
};

export default HomeMusicPlayerComponent;
