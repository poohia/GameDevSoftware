import { useState } from 'react';
import { DropDownFontsComponent, TransComponent } from 'renderer/components';
import { Button } from 'renderer/semantic-ui';
import { Container, Grid, Header, Icon } from 'semantic-ui-react';

const FontPage: React.FC = () => {
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  return (
    <Container className="game-dev-software-module-font-home" fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as="h1">
              <TransComponent id="module_font" />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={12}>
            <Button color="green" icon labelPosition="right">
              <TransComponent id="module_translation_header_button_append_translation" />
              <Icon name="add" />
            </Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}>
            <DropDownFontsComponent
              value={fontFamily}
              onChange={(_, data) => setFontFamily(data.value as string)}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row
          className="game-dev-software-module-font-home-alphabet"
          style={{ fontFamily }}
        >
          <Grid.Column width={16} textAlign="center">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ <br />
            abcdefghijklmnopqrstuvwxyz <br />
            0123456789 <br />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default FontPage;
