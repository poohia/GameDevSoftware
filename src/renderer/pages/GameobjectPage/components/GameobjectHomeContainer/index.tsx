import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { Container, Grid } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import { useEvents } from 'renderer/hooks';
import { PageProps } from 'types';
import GameobjectContainerComponent from '../GameobjectContainerComponent';

const GameobjectHomeContainer = ({ appendTab }: PageProps) => {
  const [gamesObjectType, setGameObjectType] = useState<any[]>([]);
  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-game-object-types', (args) => {
      setGameObjectType(args);
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
            {gamesObjectType.map((objectType) => (
              <Grid.Column key={objectType}>
                <Button
                  onClick={() =>
                    appendTab(
                      objectType,
                      GameobjectContainerComponent,
                      true,
                      'GameobjectContainerComponent'
                    )
                  }
                >
                  {objectType}
                </Button>
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default GameobjectHomeContainer;
