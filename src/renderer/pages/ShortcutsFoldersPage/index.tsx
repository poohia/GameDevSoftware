import { Container, Grid, Header } from 'semantic-ui-react';
import useShortcutsFolders from './useShortcutsFolders';
import { TransComponent } from 'renderer/components';
import ShortcutsFoldersHeaderComponent from './components/ShortcutsFoldersHeaderComponent';
import ShortcutsFoldersFormComponent from './components/ShortcutsFoldersFormComponent';
import ShortcutsFoldersTableComponent from './components/ShortcutsFoldersTableComponent';
import { ShortcutsFolder } from 'types';

const ShortcutsFoldersPage: React.FC = () => {
  const { shortcutsFolders, stateForm, openForm, handleSubmit, deleteFolder } =
    useShortcutsFolders();
  return (
    <Container fluid>
      <Grid divided columns={2}>
        <Grid.Row>
          <Grid.Column width={8}>
            <Grid.Row>
              <Header as="h1">
                <TransComponent id="module_shortcutsfolders" />
              </Header>
            </Grid.Row>
            <Grid.Row>
              <ShortcutsFoldersHeaderComponent onClickAdd={openForm} />
            </Grid.Row>
            <Grid.Row>
              <ShortcutsFoldersTableComponent
                shortcutsFolders={shortcutsFolders}
                keySelected={stateForm.key}
                onClickRow={openForm}
                onDelete={deleteFolder}
              />
            </Grid.Row>
          </Grid.Column>
          {stateForm.show && (
            <Grid.Column width={8}>
              <ShortcutsFoldersFormComponent
                defaultValue={stateForm.value as ShortcutsFolder}
                onSubmit={handleSubmit}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ShortcutsFoldersPage;
