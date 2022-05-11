import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Grid } from 'semantic-ui-react';
import { GameObject, GameObjectForm, PageProps } from 'types';
import GameobjectHeaderComponent from '../GameobjectHeaderComponent';
import GameobjectTableComponent from '../GameobjectTableComponent';

const GameobjectContainerComponent = (props: PageProps) => {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [gameObjectForm, setGameObjectForm] = useState<
    GameObjectForm | undefined
  >(undefined);

  const { title: gameObjectType } = props;
  const { sendMessage, on, once } = useEvents();

  const removeGameObject = useCallback(
    (id: string) => {
      sendMessage('remove-game-object', { id, objectType: gameObjectType });
    },
    [gameObjectType]
  );

  useEffect(() => {
    sendMessage('load-game-objects', gameObjectType);
    sendMessage('get-formulaire-game-object', gameObjectType);
    on(`load-game-objects-${gameObjectType}`, (args) => {
      setGameObjects(args);
    });
    once(`get-formulaire-game-object-${gameObjectType}`, (args) => {
      setGameObjectForm(args);
    });
  }, [gameObjectType]);

  console.log(gameObjectForm);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          {gameObjectForm && (
            <GameobjectHeaderComponent
              title={gameObjectForm.name}
              description={gameObjectForm.description}
            />
          )}
        </Grid.Column>
      </Grid.Row>
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
