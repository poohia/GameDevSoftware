import pathModule from 'path';
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
    // @ts-ignore
    const { path } = global;
    const targetFile = pathModule.join(
      path,
      FolderPlugin.gameDevSoftwareDirectory,
      FolderPlugin.typesFiles
    );
    Promise.all([
      this.generateScenesType(chatGPTInfos),
      this.generateGameObjectsType(chatGPTInfos),
      this.generateConstantsType(chatGPTInfos),
    ])
      .then((data) => {
        const d = data[0] + '\n\n' + data[1] + '\n\n' + data[2];
        return FileService.writeFile(targetFile, d);
      })
      .then(() => {
        LogService.Notify(`Generation done write on file ${targetFile}`, {
          type: 'success',
        });
      })
      .catch((e) => {
        if (e) {
          LogService.Notify(e, { type: 'error' });
        }
      })
      .finally(() => {
        event.reply('chatgpt-generate-types');
      });
  };

  private generateGameObjectsType = (chatGPTInfos: ChatGPTType) => {
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
                  'You are a helpful assistant that writes clean, idiomatic TypeScript type definitions from JSON configuration objects. **In every interface you generate, regardless of the config JSON, you must include these two properties at the very top (before any other field):**',
                  '- `_id: number`',
                  '- `_title: string`',
                  'Interface names must be derived from each object’s `"type"` field by converting kebab-case to PascalCase.',
                  'Mapping rules for each core property:',
                  '- `"boolean"`→ `boolean`',
                  '- `"number"` or `"float"` → `number`',
                  '- Literals `"image"`, `"translation"`, `"json"`, `"string"`, `"video"`, or all started with `"@"` (like `"@go"` or `"@a:"`) etc. → `string`',
                  '- References starting with @c: should replace the following text by converting it to PascalCase . This type will be created in another script, so you don’t need to generate it yourself',
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

  private generateScenesType = (chatGPTInfos: ChatGPTType) => {
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
              FolderPlugin.sceneTypesDirectory
            );
            FileService.readdir(moduleDirectory, 'file').then((filesName) => {
              Promise.all(
                filesName.map((file) =>
                  FileService.readJsonFile(
                    pathModule.join(
                      path,
                      FolderPlugin.modulesDirectory,
                      name,
                      FolderPlugin.sceneTypesDirectory,
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
                  'You are a helpful assistant that writes clean, idiomatic TypeScript type definitions from JSON configuration objects. **In every interface you generate, regardless of the config JSON, you must include these two properties at the very top (before any other field):**',
                  '- `_id: number`',
                  '- `_title: string`',
                  'Interface names must be derived from each object’s `"type"` field by converting kebab-case to PascalCase and add suffix `Props` (PascalCaseProps)',
                  'Only append the Props suffix to the interface derived from the root object’s "type" field. Nested interfaces generated for inner objects or arrays should be named in plain PascalCase without the Props suffix.',
                  'Mapping rules for each core property:',
                  '- `"boolean"`→ `boolean`',
                  '- `"number"` or `"float"` → `number`',
                  '- `"float"` on typescript is `number`',
                  '- Literals `"image"`, `"translation"`, `"json"`, `"string"`, `"video"`, or all started with `"@"` (like `"@go"` or `"@a:"`) etc. → `string`',
                  '- References starting with @c: should replace the following text by converting it to PascalCase. This type will be created in another script, so you don’t need to generate it yourself',
                  '- If `"multiple": true`, wrap the type in an array (`TypeName[]`).',
                  '- If `"optional": true`, mark the property optional with `?`.',
                  // '- If a core field is an object, interpret its keys and values. If any of those values is itself an object, apply the same rule recursively: base the type solely on its core property and ignore all other properties.',
                  '- Flatten simple core-objects: If a field’s "core" is an object whose direct children are themselves objects with a primitive "core" (and possibly metadata like "label"), then do not emit a nested interface for that wrapper—map each child property directly to the primitive type named in its own "core" and ignore all other keys.',
                  '- If a `"core"` is an object does not take into account rules for keys `_id` and `_title` ',
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

  private generateConstantsType = (chatGPTInfos: ChatGPTType) => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const { path } = global;
      FileService.readJsonFile(
        pathModule.join(path, FolderPlugin.constantFile)
      ).then(async (json) => {
        if (!openAI || !chatGPTInfos) {
          reject();
          return;
        }

        // Prépare la conversation avec un prompt en anglais
        const messages: ChatCompletionMessageParam[] = [
          {
            role: 'system',
            content: [
              'You are a helpful assistant that generates TypeScript type aliases from a JSON array of configuration objects.',
              'For each object in the array:',
              '- Convert its `"key"` (kebab-case or snake_case) to PascalCase and use that as the alias name.',
              '- Map its `"value"` to a TypeScript literal or union type:',
              '  • If the value is an array, emit a union of its elements (e.g. `("a" | "b" | "c")`).',
              '  • If the value is a string, emit a string literal type (e.g. `"foo.png"`).',
              '  • If the value is a number, emit a numeric literal type (e.g. `42`).',
              '- Use the syntax `export type AliasName = <type>;`.',
              'Output only the TypeScript code, one `export type` per line, with no additional commentary.',
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
          const code = response.choices[0].message?.function_call?.arguments;
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
  };
}
