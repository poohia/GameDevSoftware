import { useEffect, useState } from 'react';
import { DropdownLanguagesComponent } from 'renderer/components';
import useTranslationPage from 'renderer/pages/TranslationPage/useTranslationPage';
import useMessages, { useMessagesProps } from '../../useMessages';

const DropdownLocale: React.FC<useMessagesProps> = ({ refIframe }) => {
  const [locale, setLocale] = useState<string>('en');
  const { languages } = useTranslationPage();
  const { sendMessage, listenMessage } = useMessages(refIframe);

  useEffect(() => {
    listenMessage<string>('currentLocale', (response) => {
      setLocale(response.data);
    });
  }, [listenMessage]);

  return (
    <DropdownLanguagesComponent
      placeholder="Select Country"
      selection
      value={locale}
      icon="language"
      floating
      labeled
      button
      className="icon"
      search={false}
      options={languages.map((language) => ({
        key: language,
        value: language,
        flag: language === 'en' ? 'gb eng' : language,
        text: language,
      }))}
      onChange={(_, { value }) => sendMessage('setCurrentLocale', value)}
    />
  );
};

export default DropdownLocale;
