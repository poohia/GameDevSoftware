import { DropdownLanguagesComponent } from 'renderer/components';
import { Container, Grid, Icon, Radio } from 'semantic-ui-react';
import { Button, Segment } from 'renderer/semantic-ui';
import i18n, { localeEnable } from 'translations/i18n';
import { titleCase } from 'title-case';

import { PageProps } from 'types';
import TransComponent from 'renderer/components/TransComponent';
import { modulesComponent } from 'renderer/App';
import { useContext } from 'react';
import DarkModeContext from 'renderer/contexts/DarkModeContext';

type HomeGlobalModulesComponent = Required<Pick<PageProps, 'appendTab'>> & {
  onChangeLocale?: (locale: string) => void;
  modules?: string[];
};

const HomeGlobalModulesComponent = (props: HomeGlobalModulesComponent) => {
  const {
    modules = [
      'application',
      'view',
      'shortcutsfolders',
      'translation',
      'constant',
      'asset',
      'env',
      'gameobject',
      'scene',
      'font',
      'chatgpt',
    ],
    onChangeLocale,
    appendTab,
  } = props;
  const { darkModeActived, toggleDarkMode } = useContext(DarkModeContext);
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment game-dev-software-module-home-project-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          <TransComponent id="module_application_home_global_modules_title" />
        </span>
        <Grid>
          {onChangeLocale && (
            <Grid.Row>
              <Grid.Column width={4}>
                <DropdownLanguagesComponent
                  placeholder="Select Country"
                  fluid
                  selection
                  search
                  value={i18n.locale}
                  options={localeEnable.map((language) => ({
                    key: language,
                    value: language,
                    flag: language === 'en' ? 'gb eng' : language,
                    text: language,
                  }))}
                  onChange={(_, { value }) => onChangeLocale(value as string)}
                />
              </Grid.Column>
              <Grid.Column width={6}>
                <Segment>
                  <Grid textAlign="center">
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <Icon name={darkModeActived ? 'sun outline' : 'sun'} />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <Radio
                          fluid
                          slider
                          checked={darkModeActived}
                          onClick={toggleDarkMode}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          )}

          <Grid.Row columns={4} width="equals">
            {modules.map((module) => (
              <Grid.Column key={module}>
                <Button
                  onClick={() => {
                    console.log('Open tab', `${titleCase(module)}Page`);
                    appendTab(
                      `module_${module}`,
                      modulesComponent[`${titleCase(module)}Page`]
                    );
                  }}
                  fluid
                >
                  <TransComponent id={`module_${module}`} />
                </Button>
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HomeGlobalModulesComponent;
