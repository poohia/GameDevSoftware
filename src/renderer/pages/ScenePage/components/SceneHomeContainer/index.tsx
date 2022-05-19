import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { Container, Grid, Segment } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { useEvents } from 'renderer/hooks';
import { PageProps } from 'types';
import SceneContainerComponent from '../SceneContainerComponent';

const SceneHomeContainer = ({ appendTab }: PageProps) => {
  const [scenesType, setScenesType] = useState<any[]>([]);
  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-scene-types', (args) => {
      setScenesType(args);
    });
  }, []);
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          <TransComponent id="module_gameobject_home_title" />
        </span>
        <Grid>
          <Grid.Row columns={4} width="equals">
            {scenesType.map((sceneType) => (
              <Grid.Column key={sceneType}>
                <Button
                  onClick={() =>
                    appendTab(
                      sceneType,
                      SceneContainerComponent,
                      true,
                      'SceneContainerComponent'
                    )
                  }
                >
                  {sceneType}
                </Button>
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default SceneHomeContainer;
