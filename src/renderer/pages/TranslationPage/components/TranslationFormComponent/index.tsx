import { useCallback, useEffect, useState } from 'react';
import { Container, Flag, Form, Grid, Header, Input } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { TranslationObject } from 'types';

export type TranslationFormComponentValue = {
  code: string;
  value: string;
  editable?: boolean;
  deletable?: boolean;
};
export type TranslationFormComponentProps = {
  keyTranslation?: string;
  values: TranslationFormComponentValue[];
  onSubmit: (translations: any) => void;
};
const TranslationFormComponent = (props: TranslationFormComponentProps) => {
  const { keyTranslation, values, onSubmit } = props;
  const [keyValue, setKeyValue] = useState<string>(keyTranslation || '');
  const [translationsValue, setTranslationsValue] = useState<TranslationObject>(
    {}
  );
  const [editable, setEditable] = useState<boolean>(true);
  const [deletable, setDeletable] = useState<boolean>(true);

  const handleKeyChange = useCallback((value: string) => {
    setKeyValue(value.toLocaleLowerCase().replace(' ', '_'));
  }, []);

  const handleTranslationValue = useCallback(
    (value: string, code: string) => {
      setTranslationsValue((_translationValue) => {
        _translationValue[code] = { [keyValue]: value };
        return JSON.parse(JSON.stringify(_translationValue));
      });
    },
    [keyValue]
  );

  const handleSubmit = useCallback(() => {
    const values: any = {};
    Object.keys(translationsValue).forEach((code) => {
      const key: any = Object.keys(translationsValue[code])[0];
      const value = translationsValue[code][key];
      values[code] = {
        key,
        text: value,
        editable,
        deletable,
      };
    });
    onSubmit(values);
  }, [translationsValue, editable, deletable]);

  useEffect(() => {
    setKeyValue(keyTranslation || '');
  }, [keyTranslation]);

  useEffect(() => {
    if (keyValue !== '' && values.length > 0) {
      const translations: TranslationObject = {};
      values.forEach((value) => {
        translations[value.code] = { [keyValue]: value.value };
      });
      setEditable(
        typeof values[0].editable !== 'undefined' ? values[0].editable : true
      );
      setDeletable(
        typeof values[0].deletable !== 'undefined' ? values[0].deletable : true
      );
      setTranslationsValue(translations);
    } else {
      setTranslationsValue({});
    }
  }, [values, keyValue]);

  return (
    <Container fluid>
      <Grid className="game-dev-software-form-container">
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              {keyTranslation === undefined
                ? i18n.t('module_translation_form_title_new')
                : i18n.t('module_translation_form_title_update')}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container fluid>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <Form.Input
                  disabled={!!keyTranslation}
                  label={i18n.t('module_translation_form_field_key_label')}
                  value={keyValue}
                  onChange={(_: any, data: { value: string }) => {
                    handleKeyChange(data.value);
                  }}
                  type={'text'}
                  focus
                  required
                />
              </Form.Field>
              {values.map((value) => (
                <Form.Field key={value.code}>
                  <label>
                    <Flag name={value.code === 'en' ? 'gb eng' : value.code} />
                  </label>
                  <Input
                    value={
                      translationsValue[value.code]
                        ? translationsValue[value.code][keyValue]
                        : ''
                    }
                    onChange={(_, data) => {
                      handleTranslationValue(data.value, value.code);
                    }}
                    disabled={keyValue === '' || !editable}
                  />
                </Form.Field>
              ))}
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={editable}
                  onChange={() => setEditable(!editable)}
                  disabled={!editable}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={deletable}
                  onChange={() => setDeletable(!deletable)}
                  disabled={!editable}
                />
              </Form.Field>
              <Button type="submit" disabled={keyValue === ''}>
                {i18n.t('module_translation_form_field_submit')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default TranslationFormComponent;
