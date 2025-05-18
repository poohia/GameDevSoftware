import { Grid } from 'semantic-ui-react';
import GameobjectHeaderComponent from '../GameobjectHeaderComponent';
import i18n from 'translations/i18n';
import useGameobjectContainerComponent from '../GameobjectContainerComponent/useGameobjectContainerComponent';
import { PageProps } from 'types';
import GameobjectTableComponent from '../GameobjectTableComponent';
import FormGenerator from 'renderer/components/FormGenerator';
import useAllGameobjectContainerComponent from './useAllGameobjectContainerComponent';

const AllGameobjectContainerComponent: React.FC<PageProps> = (props) => {
  const {
    gameObjects,
    stateForm,
    loadingForm,
    removeGameObject,
    updateGameobject,
    sendCreateGameobject,
    closeForm,
    openFile,
  } = useGameobjectContainerComponent(props);
  const { gameObjectForm } = useAllGameobjectContainerComponent({
    stateForm,
  });

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={8}>
          <Grid.Row>
            <Grid.Column>
              <GameobjectHeaderComponent
                title={i18n.t('module_gameobject_home_title')}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <GameobjectTableComponent
              gameObjects={gameObjects}
              keySelected={stateForm.value?._id}
              title={props.title}
              isOnAll
              typeTarget="gameObjects"
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
              loading={loadingForm}
              onSubmit={sendCreateGameobject}
              onClose={closeForm}
              onOpenFileClick={openFile}
            />
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default AllGameobjectContainerComponent;
