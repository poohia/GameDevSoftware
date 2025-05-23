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
import { useEvents } from 'renderer/hooks';
import { TranslationInput } from 'renderer/components/FormGenerator/components';

type AssetFormComponentProps = {
  defaultValue?: AssetType;
  onSubmit: (value: AssertFileValueType) => void;
};
const AssetFormComponent = (props: AssetFormComponentProps) => {
  const { defaultValue, onSubmit } = props;
  const { sendMessage } = useEvents();

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
      fileAlt: defaultValue ? defaultValue.alt : '',
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
                      fileType: value.fileType,
                    })
                  }
                  disabled={disableForm}
                />
              </Form.Field>
              {file.fileType === 'image' && (
                <Form.Field disabled={disableForm}>
                  <label>Alt</label>
                  <TranslationInput
                    name=""
                    onChange={(data) => {
                      setFile({
                        ...file,
                        fileAlt: data.target.value,
                      });
                    }}
                    defaultValue={file.fileAlt}
                  />
                </Form.Field>
              )}
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={file.editable}
                  onChange={() =>
                    setFile({ ...file, editable: !file.editable })
                  }
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={file.deletable}
                  onChange={() =>
                    setFile({ ...file, deletable: !file.deletable })
                  }
                  disabled={disableForm}
                />
              </Form.Field>
              <Button
                type="submit"
                onClick={() => onSubmit(file)}
                disabled={file.fileName === ''}
              >
                {i18n.t('module_translation_form_field_submit')}
              </Button>
              {defaultValue && (
                <Button
                  type="button"
                  onClick={() => {
                    sendMessage('open-assets-folder', {
                      type: file.fileType,
                      fileName: file.fileName,
                    });
                  }}
                  color={'brown'}
                >
                  {i18n.t('module_translation_form_field_acton_open_file')}
                </Button>
              )}
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
      {defaultValue && <AssetPreviewComponent asset={defaultValue} />}
    </Container>
  );
};

export default AssetFormComponent;
