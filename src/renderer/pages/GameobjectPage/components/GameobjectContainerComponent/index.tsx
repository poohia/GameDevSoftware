import { Grid } from 'semantic-ui-react';
import { PageProps } from 'types';
import GameobjectHeaderComponent from '../GameobjectHeaderComponent';
import GameobjectTableComponent from '../GameobjectTableComponent';
import useGameobjectContainerComponent from './useGameobjectContainerComponent';
import useFormGenerator from 'renderer/components/FormGenerator/useFormGenerator';

const GameobjectContainerComponent = (props: PageProps) => {
  const {
    gameObjects,
    gameObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
  } = useGameobjectContainerComponent(props);
  // const Form = useFormGenerator({
  //   type: gameObjectForm?.type || '',
  //   form: gameObjectForm && gameObjectForm.core,
  //   defaultValues: stateForm.value,
  //   onSubmit: sendCreateGameobject,
  // });

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
              keySelected={stateForm.value?._id}
              onClickRow={updateGameobject}
              onDelete={removeGameObject}
            />
          </Grid.Row>
        </Grid.Column>
        {stateForm.show && gameObjectForm && (
          <Grid.Column width={8}>
            {/* <GameobjectFormComponent
              type={gameObjectForm.type}
              form={gameObjectForm.core}
              defaultValues={stateForm.value}
              onSubmit={sendCreateGameobject}
            /> */}
            {/* {Form} */}
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default GameobjectContainerComponent;
