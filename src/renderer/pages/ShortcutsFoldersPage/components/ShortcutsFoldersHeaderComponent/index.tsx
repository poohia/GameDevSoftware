import { TransComponent } from 'renderer/components';
import { Button } from 'renderer/semantic-ui';
import { Grid, Icon } from 'semantic-ui-react';

const ShortcutsFoldersHeaderComponent: React.FC<{ onClickAdd: () => void }> = ({
  onClickAdd,
}) => {
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" labelPosition="right" onClick={onClickAdd}>
            <TransComponent id="module_shortcutsfolders_create" />
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default ShortcutsFoldersHeaderComponent;
