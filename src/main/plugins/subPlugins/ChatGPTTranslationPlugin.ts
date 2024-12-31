import { ChatCompletionMessageParam } from 'openai/resources';
import pathModule from 'path';
import fs from 'fs';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';
import FileService from '../../services/FileService';
import LogService from '../../services/LogService';
import { openAI } from '../ChatGPTPlugin';

export default class ChatGPTTranslationPlugin {
  autoTranslate = (
    event: ElectronIpcMainEvent,
    data: { key: string; locale: string },
    chatGPTInfos?: ChatGPTType
  ) => {
    const { key, locale } = data;
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
                              It's a {locale: {key:value}} structure, don't modify the key. Answer with json content only, don't send me markdown.\n`,
            },
          ];
          if (chatGPTInfos?.extraPrompt) {
            messages.push({
              role: 'user',
              content: `Other tips for translation: ${chatGPTInfos.extraPrompt}\n`,
            });
          }
          console.log({ [locale]: translateFind });
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

  translateFile = (
    event: ElectronIpcMainEvent,
    data: { gameLocale: string; targetLocale: string },
    chatGPTInfos?: ChatGPTType
  ) => {
    const { gameLocale, targetLocale } = data;
    // @ts-ignore
    const { path } = global;
    const pathGameLocale = pathModule.join(
      path,
      FolderPlugin.translationDirectory,
      `${gameLocale}.json`
    );
    const pathTargetLocale = pathModule.join(
      path,
      FolderPlugin.translationDirectory,
      `${targetLocale}.json`
    );
    if (
      !openAI ||
      !chatGPTInfos ||
      !chatGPTInfos.model ||
      !fs.existsSync(pathGameLocale) ||
      !fs.existsSync(pathTargetLocale)
    ) {
      event.reply('chatgpt-translate-file', false);
      return;
    }
    let timesouts: any[] = [];
    FileService.readFile(pathGameLocale).then((data) => {
      LogService.Log(JSON.parse(data));
      Promise.all(
        this.splitJSON(
          data,
          chatGPTInfos?.translation?.languageFileSplit || 1
        ).map((finalContent, id) => {
          return new Promise((resolve, reject) => {
            const messages: ChatCompletionMessageParam[] = [
              {
                role: 'system',
                content: `You are a helpful assistant that translates a i18n locale object content. Only translate a i18n locale json content from '${gameLocale}' to '${targetLocale}'.\n
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
              content: JSON.stringify(finalContent),
            });
            const nb = setTimeout(() => {
              LogService.Log({ finalContent: finalContent });
              openAI!.chat.completions
                .create({
                  temperature: 1,
                  model: chatGPTInfos.model,
                  messages: messages,
                })
                .then((completion) => {
                  if (completion.choices[0].finish_reason !== 'stop') {
                    return Promise.reject(completion.choices[0].finish_reason);
                  }
                  return completion;
                })
                .then((completion) => {
                  return JSON.parse(
                    completion.choices[0].message?.content || '[]'
                  );
                })
                .then((completionJSON) => {
                  resolve({ result: completionJSON });
                })
                .catch((e) => reject(e));
            }, 1200 * id);
            timesouts.push(nb);
          });
        })
      )
        .then((results: any) => {
          LogService.Log({ results1: results });
          const flattenedArray: any = [];
          results.forEach((item: any) => {
            const result = item.result;
            if (result) {
              Object.values(result).forEach((entry) => {
                flattenedArray.push(entry);
              });
            }
          });
          return Promise.resolve(flattenedArray);
        })
        .then((results) => {
          LogService.Log({ results2: results });
          return FileService.writeJsonFile(pathTargetLocale, results);
        })
        .then(() => {
          LogService.Notify('notification.message.file.translated', {
            type: 'success',
          });
          event.reply('chatgpt-translate-file', true);
        })
        .catch((e) => {
          LogService.Log(e);
          LogService.Notify(e, {
            type: 'error',
            delay: 6000,
          });
          event.reply('chatgpt-translate-file', false);
          timesouts.forEach((t) => clearTimeout(t));
        });
    });
  };

  splitJSON = (json: string, parts: number): { [key: string]: string }[] => {
    const jsonObj = JSON.parse(json);
    const result: any[] = [];

    for (let i = 0; i < parts; i++) {
      result.push({});
    }

    const keys = Object.keys(jsonObj);
    const groupSize = Math.ceil(keys.length / parts);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = jsonObj[key];
      const groupIndex = Math.floor(i / groupSize);

      result[groupIndex][key] = value;
    }

    return result.filter((obj: any) => Object.keys(obj).length > 0);
  };
}
