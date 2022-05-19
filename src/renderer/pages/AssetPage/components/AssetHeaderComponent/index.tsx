import { Grid, Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssetHeaderComponentProps } from 'types';

const AssetHeaderComponent = (
  props: AssetHeaderComponentProps & { onClickMultipleAdd: () => void }
) => {
  const { onClickAdd, onClickMultipleAdd } = props;
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" labelPosition="right" onClick={onClickAdd}>
            {i18n.t('module_constant_header_append_asset')}
            <Icon name="add" />
          </Button>
          <Button
            icon
            color="teal"
            labelPosition="right"
            onClick={onClickMultipleAdd}
          >
            {i18n.t('module_constant_header_append_multiple_asset')}
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default AssetHeaderComponent;
