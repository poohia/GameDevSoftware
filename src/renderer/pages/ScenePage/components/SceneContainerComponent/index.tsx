import { Grid } from 'semantic-ui-react';
import { PageProps } from 'types';
import GameobjectHeaderComponent from 'renderer/pages/GameobjectPage/components/GameobjectHeaderComponent';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';
import useSceneContainerComponent from './useSceneContainerComponent';
import FormGenerator from 'renderer/components/FormGenerator';

const SceneContainerComponent = (props: PageProps) => {
  const {
    scenes,
    gameObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
  } = useSceneContainerComponent(props);

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
              gameObjects={scenes}
              keySelected={stateForm.value?._id}
              onClickRow={updateGameobject}
              onDelete={removeGameObject}
            />
          </Grid.Row>
        </Grid.Column>
        {stateForm.show && gameObjectForm && (
          <Grid.Column width={8}>
            <FormGenerator
              type={gameObjectForm.type}
              form={gameObjectForm.core}
              defaultValues={stateForm.value}
              onSubmit={sendCreateGameobject}
            />
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default SceneContainerComponent;
