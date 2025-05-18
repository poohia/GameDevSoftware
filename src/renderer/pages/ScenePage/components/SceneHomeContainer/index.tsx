import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { Container, Grid, Popup } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import { useEvents } from 'renderer/hooks';
import { PageProps, SceneObjectForm } from 'types';
import SceneContainerComponent from '../SceneContainerComponent';
import DropdownFirstScene from '../DropdownFirstScene';
import AllSceneContainerComponent from '../AllSceneContainerComponent';

const SceneHomeContainer = ({ appendTab }: PageProps) => {
  const [scenesType, setScenesType] = useState<
    (SceneObjectForm & { typeId: string })[]
  >([]);
  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-scenes-types', (args) => {
      setScenesType(args);
    });
  }, []);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          <TransComponent id="form_scene_module_first_scene" />
        </span>
        <Grid>
          <Grid.Row columns={1}>
            <DropdownFirstScene />
          </Grid.Row>
        </Grid>
      </Segment>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          <TransComponent id="module_scene_title" />
        </span>
        <Grid>
          <Grid.Row columns={4} width="equals">
            <Grid.Column>
              <Button
                onClick={() =>
                  appendTab(
                    'all',
                    AllSceneContainerComponent,
                    true,
                    'AllSceneContainerComponent'
                  )
                }
                fluid
              >
                <TransComponent id="module_scene_home_title" />
              </Button>
            </Grid.Column>
            {scenesType.map((sceneType) => (
              <Grid.Column key={sceneType.typeId}>
                <Popup
                  position="bottom center"
                  trigger={
                    <Button
                      onClick={() =>
                        appendTab(
                          sceneType.typeId,
                          SceneContainerComponent,
                          true,
                          'SceneContainerComponent'
                        )
                      }
                      fluid
                    >
                      {sceneType.name}
                    </Button>
                  }
                  content={sceneType.description}
                  disabled={!sceneType.description}
                />
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default SceneHomeContainer;
