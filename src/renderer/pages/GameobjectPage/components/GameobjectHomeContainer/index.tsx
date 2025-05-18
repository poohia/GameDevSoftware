import { useEffect, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { Container, Grid, Popup } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import { useEvents } from 'renderer/hooks';
import { GameObjectForm, PageProps } from 'types';
import GameobjectContainerComponent from '../GameobjectContainerComponent';
import AllGameobjectContainerComponent from '../AllGameobjectContainerComponent';

const GameobjectHomeContainer = ({ appendTab }: PageProps) => {
  const [gamesObjectType, setGameObjectType] = useState<
    (GameObjectForm & { typeId: string })[]
  >([]);
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
            <Grid.Column>
              <Button
                onClick={() =>
                  appendTab(
                    'all',
                    AllGameobjectContainerComponent,
                    true,
                    'AllGameobjectContainerComponent'
                  )
                }
                fluid
              >
                <TransComponent id="module_gameobject_home_title" />
              </Button>
            </Grid.Column>
            {gamesObjectType.map((objectType) => (
              <Grid.Column key={objectType.typeId}>
                <Popup
                  position="bottom center"
                  trigger={
                    <Button
                      onClick={() =>
                        appendTab(
                          objectType.typeId,
                          GameobjectContainerComponent,
                          true,
                          'GameobjectContainerComponent'
                        )
                      }
                      fluid
                    >
                      {objectType.name}
                    </Button>
                  }
                  content={objectType.description}
                  disabled={!objectType.description}
                />
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default GameobjectHomeContainer;
