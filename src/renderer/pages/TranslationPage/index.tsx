import React, { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Button } from 'semantic-ui-react';

const TranslationPage = () => {
  const { once, sendMessage } = useEvents();
  const [languages, setLanguages] = useState<{ code: string }[]>([]);
  const [tranductions, setTraductions] = useState<any>();

  useEffect(() => {
    sendMessage('load-translations');
    once('languages-authorized', (args: string[]) => {
      setLanguages(args);
    });
    once('load-translations', (args) => {
      setTraductions(args);
    });
  }, []);
  if (tranductions) {
    console.log(tranductions);
    console.log(languages[0]);
    console.log(tranductions[languages[0].code]);
  }
  return (
    <div>
      <Button
        onClick={() => {
          sendMessage('save-translations');
        }}
      >
        Save
      </Button>
    </div>
  );
};

export default TranslationPage;
