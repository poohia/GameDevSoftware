import { Button, Grid, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssetHeaderComponentProps } from 'types';

const AssetHeaderComponent = (props: AssetHeaderComponentProps) => {
  const { onClickAdd } = props;
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" onClick={onClickAdd}>
            {i18n.t('module_constant_header_append_constant')}
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default AssetHeaderComponent;
