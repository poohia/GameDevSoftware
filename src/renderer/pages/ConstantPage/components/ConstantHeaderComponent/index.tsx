import { Grid, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { AssetHeaderComponentProps } from 'types';
import { TransComponent } from 'renderer/components';

const ConstantHeaderComponent = (props: AssetHeaderComponentProps) => {
  const { onClickAdd } = props;
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" labelPosition="right" onClick={onClickAdd}>
            <TransComponent id="module_constant_header_append_constant" />
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default ConstantHeaderComponent;
