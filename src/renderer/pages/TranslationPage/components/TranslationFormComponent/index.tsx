import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Container,
  Flag,
  Form,
  Grid,
  Header,
  Icon,
  Input,
} from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ChatGPTType, Translation, TranslationObject } from 'types';
import { countryOptions } from 'renderer/components/DropdownLanguagesComponent';
import ChatGPTContext from 'renderer/contexts/ChatGPTContext';
import { useEvents } from 'renderer/hooks';

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

const TranslationFormButtonsComponent: React.FC<{
  keyValue: string;
  loading: boolean;
  showAdvanced: boolean;
  setShowAdvanced: (showAdvanced: boolean) => void;
  disableAutoTranslate?: boolean;
  handleAutoTranslate: () => void;
}> = (props) => {
  const {
    keyValue,
    loading,
    setShowAdvanced,
    showAdvanced,
    disableAutoTranslate,
    handleAutoTranslate,
  } = props;
  return (
    <>
      <Button
        type="submit"
        disabled={keyValue === '' || loading}
        loading={loading}
      >
        {i18n.t('module_translation_form_field_submit')}
      </Button>
      <Button
        type="button"
        color="brown"
        onClick={() => setShowAdvanced(!showAdvanced)}
        basic={!showAdvanced}
        loading={loading}
        disabled={loading}
      >
        {i18n.t('module_application_params_advanced_title')}
      </Button>
      <Button
        type="button"
        color="yellow"
        // disabled={!chatGPTInfos?.apiKey || loading || !keyTranslation}
        disabled={disableAutoTranslate}
        labelPosition="right"
        icon
        loading={loading}
        onClick={handleAutoTranslate}
      >
        {i18n.t('module_translation_form_field_button_auto_translate')}
        <Icon name="user secret" />
      </Button>
    </>
  );
};

const TranslationFormComponent = (
  props: TranslationFormComponentProps & { gameLocale: string }
) => {
  const { keyTranslation, values, gameLocale, onSubmit } = props;
  const { chatGPTInfos } = useContext(ChatGPTContext);
  const { sendMessage, once } = useEvents();

  const [keyValue, setKeyValue] = useState<string>(keyTranslation || '');
  const [translationsValue, setTranslationsValue] = useState(values);
  const [editable, setEditable] = useState<boolean>(true);
  const [deletable, setDeletable] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(
    !!values.find((v) => v.valueComputer || v.valueMobile)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [disableAutoTranslate, setDisableAutoTranslate] =
    useState<boolean>(true);

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
      setDisableAutoTranslate(true);
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

  const handleAutoTranslate = useCallback(() => {
    if (!keyTranslation) return;
    setLoading(true);
    sendMessage('chatgpt-auto-translate', {
      key: keyTranslation,
      locale: gameLocale,
    });
    once('chatgpt-auto-translate', (data: TranslationObject | null) => {
      if (data === null) {
        setLoading(false);
        return;
      }
      setTranslationsValue((_translationValue) => {
        Object.keys(data).forEach((code) => {
          const translationFind = _translationValue.find(
            (t) => t.code === code
          );
          const d: Translation = data[code] as any;
          if (translationFind) {
            translationFind.value =
              d.text !== undefined ? d.text : translationFind.value;
            translationFind.valueComputer =
              d.textComputer !== undefined
                ? d.textComputer
                : translationFind.valueComputer;
            translationFind.valueMobile =
              d.textMobile !== undefined
                ? d.textMobile
                : translationFind.valueMobile;
          }
        });
        setLoading(false);
        return JSON.parse(JSON.stringify(_translationValue));
      });
    });
  }, []);

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

  useEffect(() => {
    if (!keyTranslation || values.length === 0) {
      setDisableAutoTranslate(true);
    } else if (!!values.find((v) => v.code === gameLocale && !v.value)) {
      setDisableAutoTranslate(true);
    } else {
      setDisableAutoTranslate(
        !chatGPTInfos?.apiKey || loading || !keyTranslation
      );
    }
  }, [values, chatGPTInfos, loading, keyTranslation, gameLocale]);

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
              <TranslationFormButtonsComponent
                keyValue={keyValue}
                keyTranslation={keyTranslation}
                handleAutoTranslate={handleAutoTranslate}
                loading={loading}
                setShowAdvanced={setShowAdvanced}
                showAdvanced={showAdvanced}
                disableAutoTranslate={disableAutoTranslate}
              />
              <br /> <br />
              <Form.Field>
                <Form.Input
                  disabled={!!keyTranslation || loading}
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
                      disabled={keyValue === '' || !editable || loading}
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
                          disabled={keyValue === '' || !editable || loading}
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
                          disabled={keyValue === '' || !editable || loading}
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
                  disabled={loading}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={deletable}
                  onChange={() => setDeletable(!deletable)}
                  disabled={loading}
                />
              </Form.Field>
              <TranslationFormButtonsComponent
                keyValue={keyValue}
                handleAutoTranslate={handleAutoTranslate}
                loading={loading}
                setShowAdvanced={setShowAdvanced}
                showAdvanced={showAdvanced}
                disableAutoTranslate={disableAutoTranslate}
              />
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default TranslationFormComponent;
