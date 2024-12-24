import { useCallback, useEffect, useState } from 'react';
import { Container, Flag, Form, Grid, Header, Input } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { Translation } from 'types';
import { countryOptions } from 'renderer/components/DropdownLanguagesComponent';

export type TranslationFormComponentValue = {
  code: string;
  value: string;
  valueComputer?: string;
  valueMobile?: string;
  editable?: boolean;
  deletable?: boolean;
};
export type TranslationFormComponentProps = {
  keyTranslation?: string;
  values: TranslationFormComponentValue[];
  onSubmit: (translations: { [key: string]: Translation }) => void;
};
const TranslationFormComponent = (props: TranslationFormComponentProps) => {
  const { keyTranslation, values, onSubmit } = props;

  const [keyValue, setKeyValue] = useState<string>(keyTranslation || '');
  const [translationsValue, setTranslationsValue] = useState(values);
  const [editable, setEditable] = useState<boolean>(true);
  const [deletable, setDeletable] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const handleKeyChange = useCallback((value: string) => {
    setKeyValue(value.toLocaleLowerCase().replace(' ', '_'));
  }, []);

  const handleTranslationValue = useCallback(
    ({
      value,
      valueComputer,
      valueMobile,
      code,
    }: {
      value?: string;
      valueComputer?: string;
      valueMobile?: string;
      code: string;
    }) => {
      setTranslationsValue((_translationValue) => {
        const translationFind = _translationValue.find((t) => t.code === code);
        if (translationFind) {
          translationFind.value =
            value !== undefined ? value : translationFind.value;
          translationFind.valueComputer =
            valueComputer !== undefined
              ? valueComputer
              : translationFind.valueComputer;
          translationFind.valueMobile =
            valueMobile !== undefined
              ? valueMobile
              : translationFind.valueMobile;
        }
        return JSON.parse(JSON.stringify(_translationValue));
      });
    },
    [keyValue]
  );

  const handleSubmit = useCallback(() => {
    const values: { [key: string]: Translation } = {};
    translationsValue.forEach((translation) => {
      values[translation.code] = {
        key: keyValue,
        text: translation.value,
        textComputer: translation.valueComputer,
        textMobile: translation.valueMobile,
        editable,
        deletable,
      };
    });
    onSubmit(values);
    // Object.keys(translationsValue).forEach((code) => {
    //   const key: any = Object.keys(translationsValue[code])[0];
    //   const value = translationsValue[code][key];
    //   values[code] = {
    //     key,
    //     text: value,
    //     editable,
    //     deletable,
    //   };
    // });
    // onSubmit(values);
  }, [translationsValue, editable, deletable]);

  useEffect(() => {
    setKeyValue(keyTranslation || '');
  }, [keyTranslation]);

  useEffect(() => {
    if (keyValue !== '' && values.length > 0) {
      // const translations: TranslationObject = {};
      // values.forEach((value) => {
      //   translations[value.code] = { [keyValue]: value.value };
      // });
      setEditable(
        typeof values[0].editable !== 'undefined' ? values[0].editable : true
      );
      setDeletable(
        typeof values[0].deletable !== 'undefined' ? values[0].deletable : true
      );
      // setTranslationsValue(translations);
    } else {
      // setTranslationsValue({});
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
              {translationsValue.map((value) => (
                <>
                  <Form.Field key={value.code}>
                    <label>
                      <Flag
                        name={
                          countryOptions.find(
                            (country) => country.value === value.code
                          )?.flag
                        }
                      />
                    </label>
                    <Input
                      value={value.value}
                      onChange={(_, data) => {
                        handleTranslationValue({
                          value: data.value,
                          code: value.code,
                        });
                      }}
                      disabled={keyValue === '' || !editable}
                    />
                  </Form.Field>
                  {showAdvanced && (
                    <>
                      <Form.Field>
                        <Form.Input
                          label={i18n.t(
                            'module_translation_form_field_computer_text'
                          )}
                          value={value.valueComputer}
                          onChange={(_, data) => {
                            handleTranslationValue({
                              valueComputer: data.value,
                              code: value.code,
                            });
                          }}
                          type={'text'}
                          disabled={keyValue === '' || !editable}
                        />
                      </Form.Field>
                      <Form.Field>
                        <Form.Input
                          label={i18n.t(
                            'module_translation_form_field_mobile_text'
                          )}
                          onChange={(_, data) => {
                            handleTranslationValue({
                              valueMobile: data.value,
                              code: value.code,
                            });
                          }}
                          value={value.valueMobile}
                          type={'text'}
                          disabled={keyValue === '' || !editable}
                        />
                      </Form.Field>
                    </>
                  )}
                </>
              ))}
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={editable}
                  onChange={() => setEditable(!editable)}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={deletable}
                  onChange={() => setDeletable(!deletable)}
                />
              </Form.Field>
              <Button type="submit" disabled={keyValue === ''}>
                {i18n.t('module_translation_form_field_submit')}
              </Button>
              <Button
                type="button"
                color="brown"
                onClick={() => setShowAdvanced(!showAdvanced)}
                basic={!showAdvanced}
              >
                {i18n.t('module_application_params_advanced_title')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default TranslationFormComponent;
