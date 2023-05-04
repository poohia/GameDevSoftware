import { useCallback } from 'react';

type Messages = 'getSaveData' | 'setSaveData' | 'changePath';

const useMessages = (refIframe: HTMLIFrameElement) => {
  const sendMessage = useCallback(
    (title: Messages, data?: any, callback?: (data: any) => void) => {
      if (callback) {
        const receiveMessage = (env: MessageEvent<any>) => {
          window.removeEventListener('message', receiveMessage, false);
          if (env.data.message.title === 'getSaveData') {
            callback(env.data);
          }
        };
        window.addEventListener('message', receiveMessage, false);
      }
      refIframe.contentWindow?.postMessage(
        {
          title,
          data,
        },
        '*'
      );
    },
    []
  );

  const listenMessage = useCallback(
    (title: Messages, callback: (data: any) => void) => {
      const receiveMessage = (env: MessageEvent<any>) => {
        if (env.data.message?.title === title) {
          callback(env.data);
        }
      };
      window.addEventListener('message', receiveMessage, false);
    },
    []
  );

  return {
    sendMessage,
    listenMessage,
  };
};

export default useMessages;
