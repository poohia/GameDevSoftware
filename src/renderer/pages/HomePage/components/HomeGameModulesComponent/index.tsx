import { useEffect, useState } from 'react';
import { Container, Grid, Segment } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import TransComponent from 'renderer/components/TransComponent';
import { useEvents } from 'renderer/hooks';
import { PageProps } from 'types';
import GameModulePage from 'renderer/pages/GameModulePage';

const HomeGameModulesComponent = ({
  appendTab,
}: Required<Pick<PageProps, 'appendTab'>>) => {
  const [gameModules, setGameModules] = useState<string[]>([]);

  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-game-modules', (args) => {
      setGameModules(args);
    });
  }, []);

  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          <TransComponent id="module_application_home_game_modules_title" />
        </span>
        <Grid>
          <Grid.Row columns={4}>
            {gameModules.map((module) => (
              <Grid.Column width={4} key={module}>
                <Button
                  onClick={() =>
                    appendTab(
                      `${module} Module`,
                      GameModulePage,
                      true,
                      'GameModulePage'
                    )
                  }
                >
                  {`${module} Module`}
                </Button>
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HomeGameModulesComponent;
