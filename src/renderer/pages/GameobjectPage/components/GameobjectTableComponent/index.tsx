import { useMemo, useState } from 'react';
import { TransComponent } from 'renderer/components';
import { Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import { GameObject } from 'types';

type GameobjectTableComponentProps = {
  gameObjects: GameObject[];
  keySelected?: number;
  onClickRow: (id: number) => void;
  onDelete?: (id: number) => void;
};

const GameobjectTableComponent = (props: GameobjectTableComponentProps) => {
  const { gameObjects, keySelected, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');
  const formatData = useMemo(() => {
    if (filter !== '') {
      return gameObjects.filter(
        (gameObject) =>
          gameObject._id === Number(filter) ||
          gameObject._type.includes(filter) ||
          gameObject._title.includes(filter)
      );
    }
    return gameObjects;
  }, [gameObjects, filter]);
  const lengthGameObjects = useMemo(() => formatData.length, [formatData]);

  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Grid.Column>
          <Input
            icon="search"
            placeholder="Search..."
            value={filter}
            fluid
            onChange={(_, { value }) => setFilter(value as string)}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formatData.map(({ _id, _title, _type }) => (
                <Table.Row
                  key={`gameobject-${_id}`}
                  active={keySelected === _id}
                  onClick={() => onClickRow(_id)}
                >
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      <TransComponent id={_title} />
                      <Header.Subheader>{_type}</Header.Subheader>
                      <p>
                        <i>Id: {_id}</i>
                      </p>
                    </Header>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete && onDelete(_id);
                      }}
                      disabled={!onDelete}
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <TransComponent id="module_table_count" />
                  &nbsp;
                  <b>{lengthGameObjects}</b>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default GameobjectTableComponent;
