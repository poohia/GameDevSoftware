import { useEffect, useMemo, useState } from 'react';
import {
  DropdownAssetTypesComponent,
  DropzoneAssetFileComponent,
} from 'renderer/components';
import { Container, Form, Grid, Header } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { AssertFileValueType, AssetType } from 'types';
import AssetPreviewComponent from '../AssetPreviewComponent';

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
    editable: defaultValue ? defaultValue.editable : true,
    deletable: defaultValue ? defaultValue.deletable : true,
    module: defaultValue?.module,
  });

  const disableForm = useMemo(
    () => (defaultValue ? !defaultValue.editable : false),
    [defaultValue]
  );

  useEffect(() => {
    setFile({
      content: '',
      fileName: defaultValue ? defaultValue.name : '',
      fileType: defaultValue ? defaultValue.type : 'image',
      editable: defaultValue ? defaultValue.editable : true,
      deletable: defaultValue ? defaultValue.deletable : true,
      module: defaultValue?.module,
    });
  }, [defaultValue]);

  return (
    <Container fluid>
      <Grid className="game-dev-software-form-container">
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
                <label>Type (auto detecting)</label>
                <DropdownAssetTypesComponent value={file.fileType} disabled />
              </Form.Field>
              <Form.Field>
                {defaultValue && <label>{defaultValue.name}</label>}
                <DropzoneAssetFileComponent
                  onChange={(value) =>
                    setFile({
                      ...file,
                      content: value.content,
                      fileName: defaultValue
                        ? defaultValue.name
                        : value.fileName,
                    })
                  }
                  disabled={disableForm}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={file.editable}
                  onChange={() =>
                    setFile({ ...file, editable: !file.editable })
                  }
                  disabled={disableForm}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={file.deletable}
                  onChange={() =>
                    setFile({ ...file, deletable: !file.deletable })
                  }
                  disabled={
                    disableForm ||
                    (defaultValue ? !defaultValue.deletable : false)
                  }
                />
              </Form.Field>
              <Button
                type="submit"
                onClick={() => onSubmit(file)}
                disabled={file.fileName === '' || disableForm}
              >
                {i18n.t('module_translation_form_field_submit')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
      {defaultValue && <AssetPreviewComponent asset={defaultValue} />}
    </Container>
  );
};

export default AssetFormComponent;
