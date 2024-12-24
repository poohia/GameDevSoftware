import { ipcMain, dialog, BrowserWindow, shell } from 'electron';
import OpenAI from 'openai';
import { store } from '../main';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';

export default class ChatGPTPlugin {
  saveChatGPTInfos = (
    event: ElectronIpcMainEvent,
    args: Partial<ChatGPTType>
  ) => {
    const values = this.getChatGPTInfos();
    const infos: Partial<ChatGPTType> = {
      apiKey: typeof args.apiKey == 'undefined' ? values?.apiKey : args.apiKey,
      extratPrompt:
        typeof args.extratPrompt === 'undefined'
          ? values?.extratPrompt
          : args.extratPrompt,
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
    const values = this.getChatGPTInfos();
    console.log("i'm here");
    if (values?.apiKey) {
      const openai = new OpenAI({
        apiKey: values.apiKey,
        dangerouslyAllowBrowser: true,
      });
      openai.models.list().then((response) => {
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
  };
}
