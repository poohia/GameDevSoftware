import { ipcMain } from 'electron';
import OpenAI from 'openai';
import pathModule from 'path';
import FileService from '../services/FileService';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import ChatGPTTranslationPlugin from './subPlugins/ChatGPTTranslationPlugin';
import ChatGPTGenerateTypes from './subPlugins/ChatGPTGenerateTypes';
import FolderPlugin from './FolderPlugin';

export let openAI: OpenAI | null = null;

export default class ChatGPTPlugin {
  translateSubPlugin: ChatGPTTranslationPlugin = new ChatGPTTranslationPlugin();
  generateTypesSubPlugin: ChatGPTGenerateTypes = new ChatGPTGenerateTypes();

  saveChatGPTInfos = (
    event: ElectronIpcMainEvent,
    args: Partial<ChatGPTType>
  ) => {
    this.getChatGPTInfos().then((values) => {
      const infos: Partial<ChatGPTType> = {
        apiKey:
          typeof args.apiKey == 'undefined' ? values?.apiKey : args.apiKey,
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
    });
  };

  loadChatGPTInfos = (event: ElectronIpcMainEvent) => {
    this.getChatGPTInfos().then((data) => {
      event.reply('load-chatgpt-infos', data);
    });
  };

  loadChatGPTModels = (event: ElectronIpcMainEvent) => {
    this.getChatGPTInfos().then(() => {
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
    });
  };

  getChatGPTInfos = (): Promise<ChatGPTType | undefined> => {
    const { path } = global;
    const chatGPTFilePath = pathModule.join(path, FolderPlugin.chatGPTFile);
    return FileService.readJsonFile(chatGPTFilePath).then((data) => {
      if (data.apiKey) {
        openAI = new OpenAI({
          apiKey: data.apiKey,
          dangerouslyAllowBrowser: true,
        });
      }
      return data;
    });
  };

  setChatGPTInfos = (infos: Partial<ChatGPTType>) => {
    const { path } = global;
    const chatGPTFilePath = pathModule.join(path, FolderPlugin.chatGPTFile);
    return FileService.writeJsonFile(chatGPTFilePath, infos);
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
    ipcMain.on(
      'chatgpt-auto-translate',
      (event: Electron.IpcMainEvent, args) => {
        this.getChatGPTInfos().then((data) => {
          this.translateSubPlugin.autoTranslate(
            event as ElectronIpcMainEvent,
            args,
            data
          );
        });
      }
    );
    ipcMain.on(
      'chatgpt-translate-file',
      (event: Electron.IpcMainEvent, args) => {
        this.getChatGPTInfos().then((data) => {
          this.translateSubPlugin.translateFile(
            event as ElectronIpcMainEvent,
            args,
            data
          );
        });
      }
    );
    ipcMain.on('chatgpt-generate-types', (event: Electron.IpcMainEvent) => {
      this.getChatGPTInfos()
        .then((data) => {
          return this.generateTypesSubPlugin.savePrevTypes().then(() => data);
        })
        .then((data) => {
          this.generateTypesSubPlugin.generateTypes(
            event as ElectronIpcMainEvent,
            data
          );
        });
    });
  };
}
