import { useState } from 'react';
import { DropDownFontsComponent, TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Button } from 'renderer/semantic-ui';
import { Container, Grid, Header, Icon } from 'semantic-ui-react';

const FontPage: React.FC = () => {
  const [fontFamily, setFontFamily] = useState<string | undefined>(undefined);
  const { sendMessage } = useEvents();

  return (
    <Container className="game-dev-software-module-font-home" fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={2}>
            <Header as="h1">
              <TransComponent id="module_font" />
            </Header>
          </Grid.Column>
          <Grid.Column width={4}>
            <Button
              color="green"
              icon
              labelPosition="right"
              onClick={() => sendMessage('append-fonts')}
            >
              <TransComponent id="module_font_append_font" />
              <Icon name="add" />
            </Button>
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
            <b>Lorem ipsum dolor sit amet consectetur adipisicing elit.</b>
            <br />
            <i>Lorem ipsum dolor sit amet consectetur adipisicing elit.</i>
            <br />
            Font family: {fontFamily}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <DropDownFontsComponent
              value={fontFamily}
              onChange={(_, data) => setFontFamily(data.value as string)}
              canDelete
              forceFirstValue
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default FontPage;
