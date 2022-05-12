import { Grid } from 'semantic-ui-react';
import { PageProps } from 'types';
import { FormGenerator as GameobjectFormComponent } from 'renderer/components';
import GameobjectHeaderComponent from '../GameobjectHeaderComponent';
import GameobjectTableComponent from '../GameobjectTableComponent';
import useGameobjectContainerComponent from './useGameobjectContainerComponent';

const GameobjectContainerComponent = (props: PageProps) => {
  const {
    gameObjects,
    gameObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
  } = useGameobjectContainerComponent(props);

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={8}>
          <Grid.Row>
            <Grid.Column>
              {gameObjectForm && (
                <GameobjectHeaderComponent
                  title={gameObjectForm.name}
                  description={gameObjectForm.description}
                  onClickAdd={createGameobject}
                />
              )}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <GameobjectTableComponent
              gameObjects={gameObjects}
              onDelete={removeGameObject}
            />
          </Grid.Row>
        </Grid.Column>
        {stateForm.show && gameObjectForm && (
          <Grid.Column width={8}>
            <GameobjectFormComponent
              type={gameObjectForm.type}
              form={gameObjectForm.core}
            />
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default GameobjectContainerComponent;
