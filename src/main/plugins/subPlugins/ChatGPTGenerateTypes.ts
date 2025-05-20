import pathModule from 'path';
import fs from 'fs';
import async from 'async';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';
import { openAI } from '../ChatGPTPlugin';
import FileService from '../../services/FileService';
import LogService from '../../services/LogService';
import { ChatCompletionMessageParam } from 'openai/resources';

export default class ChatGPTGenerateTypes {
  generateTypes = (event: ElectronIpcMainEvent, chatGPTInfos?: ChatGPTType) => {
    if (!chatGPTInfos) {
      LogService.Notify('ChatGPT Api required', { type: 'error' });
      event.reply('chatgpt-generate-types');
      return;
    }
    this.generateGameObjectsType(chatGPTInfos)
      .then((data) => {
        LogService.Notify('Generation done', { type: 'success' });
        LogService.Log('========');
        LogService.Log(data);
      })
      .finally(() => {
        event.reply('chatgpt-generate-types');
      });
  };

  generateGameObjectsType = (chatGPTInfos: ChatGPTType) => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const { path } = global;
      let json: any[] = [];
      const modulesPath = pathModule.join(path, FolderPlugin.modulesDirectory);
      FileService.readdir(modulesPath, 'directory').then((names) => {
        async
          .each(names, (name: string, callback: () => void) => {
            const moduleDirectory = pathModule.join(
              path,
              FolderPlugin.modulesDirectory,
              name,
              FolderPlugin.gameObjectTypesDirectory
            );
            FileService.readdir(moduleDirectory, 'file').then((filesName) => {
              Promise.all(
                filesName.map((file) =>
                  FileService.readJsonFile(
                    pathModule.join(
                      path,
                      FolderPlugin.modulesDirectory,
                      name,
                      FolderPlugin.gameObjectTypesDirectory,
                      file
                    )
                  )
                )
              ).then((results) => {
                json = json.concat(results);
                callback();
              });
            });
          })
          .then(async () => {
            if (!openAI || !chatGPTInfos) {
              reject();
              return;
            }
            // Prépare la conversation avec un prompt en anglais
            const messages: ChatCompletionMessageParam[] = [
              {
                role: 'system',
                content: [
                  'You are a helpful assistant that writes clean, idiomatic TypeScript type definitions from JSON configuration objects.',
                  'Interface names must be derived from each object’s `"type"` field by converting kebab-case to PascalCase.',
                  'Every generated interface must include the properties:',
                  '- `_id: number`',
                  '- `_title: string`',
                  'Mapping rules for each core property:',
                  '- `"number"` or `"float"` → `number`',
                  '- Literals `"image"`, `"translation"`, `"json"`, `"string"`, `"video"`, `"@c:"`, etc. → `string`',
                  '- References starting with `@go:` → strip prefix and convert the suffix to PascalCase; use that as a type name (e.g. `@go:retrospaceadventure-skill` → `RetrospaceAdventureSkill`).',
                  '- If `"multiple": true`, wrap the type in an array (`TypeName[]`).',
                  '- If `"optional": true`, mark the property optional with `?`.',
                  '- If a `"core"` value is itself an object, generate a nested interface named `<ParentName><PropertyName>` (PascalCase).',
                  'Please output a single `.ts` file exporting all interfaces and referenced types.',
                ].join(' '),
              },
              {
                role: 'user',
                content: [
                  'Here is the JSON array of configurations:',
                  '```json',
                  JSON.stringify(json, null, 2),
                  '```',
                ].join('\n'),
              },
            ];

            if (chatGPTInfos.extraPrompt) {
              messages.push({
                role: 'user',
                content: `Other tips for translation: ${chatGPTInfos.extraPrompt}\n`,
              });
            }

            try {
              // Appel à l’API Chat Completions
              const response = await openAI.chat.completions.create({
                model: chatGPTInfos.model,
                messages,
                temperature: 0.2,
                functions: [
                  {
                    name: 'write_code',
                    description: 'Generate a TS module given JSON',
                    parameters: {
                      type: 'object',
                      properties: {
                        code: {
                          type: 'string',
                          description: 'The complete TS source code',
                        },
                      },
                      required: ['code'],
                    },
                  },
                ],
                function_call: { name: 'write_code' },
              });

              // Récupère le code renvoyé par la fonction
              const code =
                response.choices[0].message?.function_call?.arguments;
              if (!code) {
                throw new Error('No code returned by the assistant.');
              }

              resolve(JSON.parse(code).code);
            } catch (e) {
              LogService.Notify(JSON.stringify(e));
              reject(e);
            }
          });
      });
    });
  };
}
