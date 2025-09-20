import { useEffect, useMemo, useState } from 'react';
import { useDatabase } from 'renderer/hooks';
import { Button, Table } from 'renderer/semantic-ui';
import { Grid, Header, Icon, Input } from 'semantic-ui-react';
import { ShortcutsFolder } from 'types';

type ShortcutsFoldersTableComponentProps = {
  shortcutsFolders: ShortcutsFolder[];
  keySelected?: string;
  onClickRow: (folder: ShortcutsFolder) => void;
  onDelete: (id: number) => void;
};

const ShortcutsFoldersTableComponent: React.FC<
  ShortcutsFoldersTableComponentProps
> = (props) => {
  const { shortcutsFolders, keySelected, onClickRow, onDelete } = props;
  const { setItem, getItem } = useDatabase();
  const [filter, setFilter] = useState<string>(() => {
    return getItem<string>('shortcutsfolder-filter') || '';
  });

  const results = useMemo(() => {
    return shortcutsFolders
      .filter(
        (folder) =>
          folder.id.toString().toLocaleLowerCase().includes(filter) ||
          folder.folderName.toLocaleLowerCase().includes(filter)
      )
      .reverse();
  }, [shortcutsFolders, filter]);

  useEffect(() => {
    setItem('shortcutsfolder-filter', filter);
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
            onChange={(_, { value }) => setFilter(value.toLocaleLowerCase())}
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
              {results.map((folder) => (
                <Table.Row
                  key={`table-shortcutsfolder-${folder.id}`}
                  active={keySelected === folder.id.toString()}
                  onClick={() => onClickRow(folder)}
                >
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {folder.folderName}
                      <Header.Subheader>ID: {folder.id}</Header.Subheader>
                    </Header>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(folder.id);
                      }}
                      disabled={folder.deletable === false}
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};
export default ShortcutsFoldersTableComponent;
