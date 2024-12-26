import { ipcMain } from 'electron';
import OpenAI from 'openai';
import { store } from '../main';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import ChatGPTTranslationPlugin from './subPlugins/ChatGPTTranslationPlugin';

export let openAI: OpenAI | null = null;

export default class ChatGPTPlugin {
  translateSubPlugin: ChatGPTTranslationPlugin = new ChatGPTTranslationPlugin();

  saveChatGPTInfos = (
    event: ElectronIpcMainEvent,
    args: Partial<ChatGPTType>
  ) => {
    console.log('🚀 ~ ChatGPTPlugin ~ args:', args);
    const values = this.getChatGPTInfos();
    const infos: Partial<ChatGPTType> = {
      apiKey: typeof args.apiKey == 'undefined' ? values?.apiKey : args.apiKey,
      extraPrompt:
        typeof args.extraPrompt === 'undefined'
          ? values?.extraPrompt
          : args.extraPrompt,
      model: args.model || values?.model,
      translation: {
        languageFileSplit:
          typeof args.translation?.languageFileSplit === 'undefined'
            ? values?.translation?.languageFileSplit
            : args.translation.languageFileSplit,
      },
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
      this.translateSubPlugin.autoTranslate(
        event as ElectronIpcMainEvent,
        args,
        this.getChatGPTInfos()
      )
    );
    ipcMain.on('chatgpt-translate-file', (event: Electron.IpcMainEvent, args) =>
      this.translateSubPlugin.translateFile(
        event as ElectronIpcMainEvent,
        args,
        this.getChatGPTInfos()
      )
    );
  };
}
