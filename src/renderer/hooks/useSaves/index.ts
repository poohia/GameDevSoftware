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

  const eraseSave = useCallback((save: GameDatabaseSave) => {
    setSaves((_saves) => {
      const saveFind = _saves.find((s) => s.id === save.id);
      if (saveFind) {
        saveFind.game = save.game;
      }
      sendMessage('set-saves', _saves);
      return Array.from(_saves);
    });
  }, []);

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
      setSaves(_saves);
    });
    sendMessage('load-saves');
  }, []);

  return {
    saves,
    addSave,
    eraseSave,
    removeSave,
  };
};

export default useSaves;
