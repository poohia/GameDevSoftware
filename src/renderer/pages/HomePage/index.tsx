import { Button, Container, Grid, Segment } from 'semantic-ui-react';
import { PageProps } from 'types';
import i18n, { localeEnable } from 'translations/i18n';
import { useCallback } from 'react';
/** Pages */
import {
  ApplicationPage,
  ConstantPage,
  TranslationPage,
  AssetPage,
} from 'renderer/pages';
/**  */
import { DropdownLanguagesComponent } from 'renderer/components';
import { useDatabase } from 'renderer/hooks';
import { HomeProjectComponent } from './components';

const HomePage: React.FC<Required<PageProps>> = ({ appendTab }) => {
  const { setItem } = useDatabase();
  const onChangeLocale = useCallback((locale: string) => {
    setItem('locale', locale);
    location.reload();
  }, []);
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <HomeProjectComponent />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <Grid>
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
                      onChange={(_, { value }) =>
                        onChangeLocale(value as string)
                      }
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={4}>
                    <Button
                      onClick={() =>
                        appendTab('module_application', ApplicationPage)
                      }
                    >
                      {i18n.t('module_application')}
                    </Button>
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Button
                      onClick={() =>
                        appendTab('module_translation', TranslationPage)
                      }
                    >
                      {i18n.t('module_translation')}
                    </Button>
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Button
                      onClick={() => appendTab('module_constant', ConstantPage)}
                    >
                      {i18n.t('module_constant')}
                    </Button>
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Button
                      onClick={() => appendTab('module_asset', AssetPage)}
                    >
                      {i18n.t('module_asset')}
                    </Button>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};
export default HomePage;
