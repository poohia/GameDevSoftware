import { Grid, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import { AssetHeaderComponentProps } from 'types';
import { TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';

const AssetHeaderComponent = (
  props: AssetHeaderComponentProps & {
    onClickMultipleAdd: () => void;
  }
) => {
  // const [loadingOptimize, setLoadingOptimize] = useState<boolean>(false);
  const { onClickAdd, onClickMultipleAdd } = props;
  const { sendMessage } = useEvents();
  // const optimizeAssets = () => {
  //   if (loadingOptimize) return;
  //   setLoadingOptimize(true);
  //   sendMessage('optimize-assets');
  //   once('optimize-assets', () => {
  //     setLoadingOptimize(false);
  //   });
  // };
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" labelPosition="right" onClick={onClickAdd}>
            <TransComponent id="module_constant_header_append_asset" />
            <Icon name="add" />
          </Button>
          <Button
            icon
            color="teal"
            labelPosition="right"
            onClick={onClickMultipleAdd}
          >
            <TransComponent id="module_constant_header_append_multiple_asset" />
            <Icon name="add" />
          </Button>
          <Button
            icon
            color="olive"
            labelPosition="right"
            onClick={() => sendMessage('open-assets-folder', { type: 'root' })}
          >
            <TransComponent id="assets_action_open_folder" />
            <Icon name="zip" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default AssetHeaderComponent;
