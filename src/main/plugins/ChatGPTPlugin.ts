import { ipcMain } from 'electron';
import pathModule from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { store } from '../main';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export let openAI: OpenAI | null = null;

export default class ChatGPTPlugin {
  saveChatGPTInfos = (
    event: ElectronIpcMainEvent,
    args: Partial<ChatGPTType>
  ) => {
    const values = this.getChatGPTInfos();
    const infos: Partial<ChatGPTType> = {
      apiKey: typeof args.apiKey == 'undefined' ? values?.apiKey : args.apiKey,
      extraPrompt:
        typeof args.extraPrompt === 'undefined'
          ? values?.extraPrompt
          : args.extraPrompt,
      model: args.model || values?.model,
    };
    this.setChatGPTInfos(infos);
    this.loadChatGPTInfos(event);
    this.loadChatGPTModels(event);
  };

  loadChatGPTInfos = (event: ElectronIpcMainEvent) => {
    event.reply('load-chatgpt-infos', this.getChatGPTInfos());
  };

  loadChatGPTModels = (event: ElectronIpcMainEvent) => {
    this.getChatGPTInfos();
    if (openAI) {
      openAI.models.list().then((response) => {
        event.reply(
          'load-chatgpt-models',
          response.data.map((d) => ({
            text: d.id,
            value: d.id,
            key: d.id,
          }))
        );
      });
    } else {
      event.reply('load-chatgpt-models', []);
    }
  };

  getChatGPTInfos = (): ChatGPTType | undefined => {
    const values = store.get('chatGPTInfos') as ChatGPTType | undefined;
    if (values?.apiKey) {
      openAI = new OpenAI({
        apiKey: values.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }

    return values;
  };

  setChatGPTInfos = (infos: Partial<ChatGPTType>) => {
    return store.set('chatGPTInfos', infos);
  };

  autoTranslate = (
    event: ElectronIpcMainEvent,
    data: { key: string; locale: string }
  ) => {
    const { key, locale } = data;
    const chatGPTInfos = this.getChatGPTInfos();
    // @ts-ignore
    const { path } = global;
    const fileTranslate = pathModule.join(
      path,
      FolderPlugin.translationDirectory,
      `${locale}.json`
    );

    if (
      !openAI ||
      !fs.existsSync(fileTranslate) ||
      !chatGPTInfos ||
      !chatGPTInfos.model
    ) {
      event.reply('chatgpt-auto-translate', null);
      return;
    }
    const languagesFilePath = pathModule.join(path, FolderPlugin.languageFile);
    FileService.readJsonFile(languagesFilePath).then(
      (languages: { code: string }[]) => {
        FileService.readJsonFile(fileTranslate).then((dataTranslation) => {
          const translateFind = dataTranslation.find((d: any) => d.key === key);
          if (!translateFind) {
            event.reply('chatgpt-auto-translate', null);
            return;
          }
          const messages: ChatCompletionMessageParam[] = [
            {
              role: 'system',
              content: `You are a helpful assistant that translates a i18n locale object content. Only translate a i18n locale json content from '${locale}' to ${languages
                .filter((l) => l.code !== locale)
                .map((l) => `'${l.code}'`)
                .join(', ')}.\n
                              It's a key:value structure, don't modify the key. Answer with json content only, don't send me markdown.\n`,
            },
          ];
          if (chatGPTInfos?.extraPrompt) {
            messages.push({
              role: 'user',
              content: `Other tips for translation: ${chatGPTInfos.extraPrompt}\n`,
            });
          }
          messages.push({
            role: 'user',
            content: JSON.stringify({ [locale]: translateFind }),
          });
          openAI!.chat.completions
            .create({
              temperature: 1,
              model: chatGPTInfos.model,
              messages: messages,
            })
            .then((completion) => {
              if (completion.choices[0].finish_reason !== 'stop') {
                throw new Error(
                  `Error:: finish reason '${completion.choices[0].finish_reason}'`
                );
              }
              return completion;
            })
            .then((completion) => {
              return JSON.parse(completion.choices[0].message?.content || '[]');
            })
            .then((completionJSON) => {
              event.reply('chatgpt-auto-translate', completionJSON);
            })
            .catch(() => {
              event.reply('chatgpt-auto-translate', null);
            });
        });
      }
    );
  };

  init = () => {
    ipcMain.on('load-chatgpt-infos', (event: Electron.IpcMainEvent) =>
      this.loadChatGPTInfos(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-chatgpt-models', (event: Electron.IpcMainEvent) =>
      this.loadChatGPTModels(event as ElectronIpcMainEvent)
    );
    ipcMain.on('save-chatgpt-infos', (event: Electron.IpcMainEvent, args) =>
      this.saveChatGPTInfos(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('chatgpt-auto-translate', (event: Electron.IpcMainEvent, args) =>
      this.autoTranslate(event as ElectronIpcMainEvent, args)
    );
  };
}
