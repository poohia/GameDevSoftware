import { TransComponent } from 'renderer/components';
import { Button, Container, Grid, Header, Icon } from 'semantic-ui-react';
import { AssetHeaderComponentProps } from 'types';

type GameobjectHeaderComponentProps = Pick<
  AssetHeaderComponentProps,
  'onClickAdd'
> & {
  title: string;
  description?: string;
};

const GameobjectHeaderComponent = (props: GameobjectHeaderComponentProps) => {
  const { title, description, onClickAdd } = props;
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
              onClick={onClickAdd}
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
