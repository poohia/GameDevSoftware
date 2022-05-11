import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Grid } from 'semantic-ui-react';
import { GameObject, PageProps } from 'types';
import GameobjectTableComponent from '../GameobjectTableComponent';

const GameobjectContainerComponent = (props: PageProps) => {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const { title: gameObjectType } = props;
  const { sendMessage, on } = useEvents();

  const removeGameObject = useCallback(
    (id: string) => {
      sendMessage('remove-game-object', { id, objectType: gameObjectType });
    },
    [gameObjectType]
  );

  useEffect(() => {
    sendMessage('load-game-objects', gameObjectType);
    on(`load-game-objects-${gameObjectType}`, (args) => {
      setGameObjects(args);
    });
  }, [gameObjectType]);

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column>
          <GameobjectTableComponent
            gameObjects={gameObjects}
            onDelete={removeGameObject}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default GameobjectContainerComponent;
