import { Grid } from 'semantic-ui-react';
import useSceneContainerComponent from '../SceneContainerComponent/useSceneContainerComponent';
import GameobjectHeaderComponent from 'renderer/pages/GameobjectPage/components/GameobjectHeaderComponent';
import GameobjectTableComponent from 'renderer/pages/GameobjectPage/components/GameobjectTableComponent';
import FormGenerator from 'renderer/components/FormGenerator';
import i18n from 'translations/i18n';
import { PageProps } from 'types';
import useAllSceneContainerComponent from './useAllSceneContainerComponent';

const AllSceneContainerComponent: React.FC<PageProps> = (props) => {
  const {
    scenes,
    stateForm,
    loadingForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
    closeForm,
    openFile,
  } = useSceneContainerComponent(props);

  const { gameObjectForm } = useAllSceneContainerComponent({ stateForm });

  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column width={8}>
          <Grid.Row>
            <Grid.Column>
              <GameobjectHeaderComponent
                title={i18n.t('module_scene_home_title')}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <GameobjectTableComponent
              gameObjects={scenes}
              keySelected={stateForm.value?._id}
              title={props.title}
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

export default AllSceneContainerComponent;
