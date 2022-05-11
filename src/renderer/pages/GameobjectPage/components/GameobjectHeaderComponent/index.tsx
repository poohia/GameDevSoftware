import { TransComponent } from 'renderer/components';
import { Button, Container, Grid, Header, Icon } from 'semantic-ui-react';

type GameobjectHeaderComponentProps = {
  title: string;
  description?: string;
};

const GameobjectHeaderComponent = (props: GameobjectHeaderComponentProps) => {
  const { title, description } = props;
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              {title}
              <Header.Subheader>{description}</Header.Subheader>
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Button
              icon
              color="green"
              labelPosition="right"
              //   onClick={() => value !== null && onAppendLocale(value)}
            >
              <TransComponent id="form_title_new" />
              <Icon name="add" />
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default GameobjectHeaderComponent;
