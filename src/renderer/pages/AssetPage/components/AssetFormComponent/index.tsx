import { useState } from 'react';
import {
  DropdownAssetTypesComponent,
  DropzoneAssetFileComponent,
} from 'renderer/components';
import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { AssertFileValueType, AssetType } from 'types';

type AssetFormComponentProps = {
  defaultValue?: AssetType;
  onSubmit: (value: AssertFileValueType) => void;
};
const AssetFormComponent = (props: AssetFormComponentProps) => {
  const { defaultValue, onSubmit } = props;
  const [file, setFile] = useState<AssertFileValueType>({
    content: '',
    fileName: '',
    fileType: 'image',
  });
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              {defaultValue === undefined
                ? i18n.t('form_title_new')
                : i18n.t('form_title_update')}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container fluid>
            <Form>
              <Form.Field required>
                <label>Type</label>
                <DropdownAssetTypesComponent value={file.fileType} disabled />
              </Form.Field>
              <Form.Field>
                <DropzoneAssetFileComponent onChange={setFile} />
              </Form.Field>
              <Button
                type="submit"
                disabled={file.fileName === ''}
                onClick={() => onSubmit(file)}
              >
                {i18n.t('module_translation_form_field_submit')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetFormComponent;
