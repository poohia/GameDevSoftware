import { useCallback, useEffect, useState } from 'react';
import useEvents from '../useEvents';
import { GameDatabase, GameDatabaseSave } from 'types';

const useSaves = () => {
  const [saves, setSaves] = useState<GameDatabaseSave[]>([]);
  const { sendMessage, on } = useEvents();

  const addSave = useCallback(
    (game: GameDatabase, title?: string) => {
      const date = new Date();
      sendMessage(
        'set-saves',
        saves.concat([
          {
            id: date.getTime(),
            date: date.toString(),
            title,
            game: game.game,
            isPreset: true,
          },
        ])
      );
    },
    [saves]
  );

  const removeSave = useCallback(
    (id: number) => {
      sendMessage(
        'set-saves',
        saves.filter((save) => save.id !== id)
      );
    },
    [saves]
  );

  useEffect(() => {
    on('load-saves', (_saves) => {
      console.log('🚀 ~ on ~ _saves:', _saves, typeof _saves);
      setSaves(_saves);
    });
    sendMessage('load-saves');
  }, []);

  return {
    saves,
    addSave,
    removeSave,
  };
};

export default useSaves;
