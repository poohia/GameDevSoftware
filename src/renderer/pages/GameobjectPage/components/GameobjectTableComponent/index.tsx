import { useEffect, useMemo, useState } from 'react';
import {
  DropdownShortcutsFoldersComponent,
  TransComponent,
} from 'renderer/components';
import { Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import { GameObject, ShortcutsFolder } from 'types';
import { useDatabase } from 'renderer/hooks';

type GameobjectTableComponentProps = {
  gameObjects: GameObject[];
  keySelected?: number;
  title: string;
  isOnInput?: boolean;
  onClickRow: (id: number) => void;
  onDelete?: (id: number) => void;
};

const GameobjectTableComponent = (props: GameobjectTableComponentProps) => {
  const {
    gameObjects,
    keySelected,
    title,
    isOnInput = false,
    onClickRow,
    onDelete,
  } = props;
  const { setItem, getItem } = useDatabase();
  const [filter, setFilter] = useState<string>(() => {
    return getItem(`gameobject-${title}-filter`) || '';
  });
  const [folderFilter, setFilterFolder] = useState<ShortcutsFolder | null>(
    null
  );
  const formatData = useMemo(() => {
    let results: GameObject[] = gameObjects;
    if (filter !== '') {
      results = results.filter(
        (gameObject) =>
          gameObject._id === Number(filter) ||
          gameObject._type.includes(filter) ||
          gameObject._title.toLowerCase().includes(filter)
      );
    }
    if (isOnInput && folderFilter) {
      results = results.filter((gameObject) =>
        folderFilter.gameObjects && folderFilter.gameObjects.length > 0
          ? folderFilter.gameObjects.includes(gameObject._id)
          : false
      );
    }
    return results;
  }, [gameObjects, filter, isOnInput, folderFilter]);
  const lengthGameObjects = useMemo(() => formatData.length, [formatData]);

  useEffect(() => {
    setItem(`gameobject-${title}-filter`, filter);
  }, [filter]);

  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Grid.Column width={16}>
          <Input
            icon="search"
            placeholder="Search..."
            value={filter}
            fluid
            onChange={(_, { value }) =>
              setFilter(value.toLocaleLowerCase() as string)
            }
          />
        </Grid.Column>
        {isOnInput && (
          <Grid.Column width={16}>
            <DropdownShortcutsFoldersComponent onChange={setFilterFolder} />
          </Grid.Column>
        )}
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
