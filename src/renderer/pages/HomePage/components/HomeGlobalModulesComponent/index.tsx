import { DropdownLanguagesComponent } from 'renderer/components';
import { Button, Container, Grid, Segment } from 'semantic-ui-react';
import i18n, { localeEnable } from 'translations/i18n';
import { titleCase } from 'title-case';

import { PageProps } from 'types';
import TransComponent from 'renderer/components/TransComponent';
import { modulesComponent } from 'renderer/App';

type HomeGlobalModulesComponent = Required<Pick<PageProps, 'appendTab'>> & {
  onChangeLocale?: (locale: string) => void;
  modules?: string[];
};

const HomeGlobalModulesComponent = (props: HomeGlobalModulesComponent) => {
  const {
    modules = [
      'application',
      'translation',
      'constant',
      'asset',
      'gameobject',
      'scene',
    ],
    onChangeLocale,
    appendTab,
  } = props;
  return (
    <Container>
      <Segment className="game-dev-software-module-application-params-identity-segment">
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
            </Grid.Row>
          )}
          <Grid.Row>
            {modules.map((module) => (
              <Grid.Column width={4} key={module}>
                <Button
                  onClick={() =>
                    appendTab(
                      `module_${module}`,
                      modulesComponent[`${titleCase(module)}Page`]
                    )
                  }
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
