import { Button, Grid, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';

type ConstantHeaderComponentProps = {
  onAppendConstant: () => void;
};

const ConstantHeaderComponent = (props: ConstantHeaderComponentProps) => {
  const { onAppendConstant } = props;
  return (
    <Grid.Column width={16}>
      <Grid.Row>
        <Grid.Column>
          <Button icon color="green" onClick={onAppendConstant}>
            {i18n.t('module_constant_header_append_constant')}
            <Icon name="add" />
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default ConstantHeaderComponent;
