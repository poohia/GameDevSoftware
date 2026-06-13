import pathModule from 'path';
import async from 'async';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';
import { getChatGPTTemperature, openAI } from '../ChatGPTPlugin';
import FileService from '../../services/FileService';
import LogService from '../../services/LogService';
import { ChatCompletionMessageParam } from 'openai/resources';

const buildPersistedTypesSystemPrompt = ({
  rootTypeSuffix,
}: {
  rootTypeSuffix: 'Interface' | 'Props';
}) =>
  [
    'You generate TypeScript interfaces for the final JSON objects saved by the app after the form is submitted.',
    'The input JSON is a form configuration. The output TypeScript must describe the persisted saved data shape, not the form schema itself and not resolved domain entities.',
    `Root interface names must be derived from each root object "type" field by converting kebab-case to PascalCase and appending the suffix "${rootTypeSuffix}".`,
    'Only root objects may create named exported interfaces.',
    'Do not create helper interfaces, helper aliases, or named reusable primitive types for nested objects or repeated fields.',
    'Never emit code like `export type Boxcharacternameposition = string;`, `type Something = number`, or `interface SomeNestedThing { ... }` for nested data.',
    'If a property is a string in persisted data, write `string`. If it is repeated in many places, still write `string` everywhere instead of inventing a named alias.',
    'Nested objects should stay inline.',
    'For the mapping, only use the persisted-data meaning of `core`, `_inheritance`, `multiple`, `optional`, and the root object `"type"`.',
    'Mapping rules for the persisted saved data:',
    '- Root interfaces must always start with `_id: number` and `_title: string`.',
    '- Nested objects and array items must never receive `_id` or `_title` unless the configuration explicitly declares them.',
    '- `"boolean"` -> `boolean`.',
    '- `"number"` and `"float"` -> `number`.',
    '- `"string"`, `"image"`, `"sound"`, `"video"`, `"json"`, `"translation"`, and `"scene"` -> `string` in persisted data.',
    '- References like `@go:`, `@s:`, `@a:`, `@t:` and any other unknown `@xxx:` references stay `string` in persisted data.',
    '- References starting with `@c:CONSTANT_KEY` must use the existing TypeScript alias for that constant key, converted to PascalCase and suffixed with `Constant`.',
    '- Example: `@c:animations` must become `AnimationsConstant` as the property type.',
    '- Do not generate, declare, redefine, or export these `...Constant` aliases in this output. Only reference them and assume they already exist.',
    '- If a configuration object contains `_inheritance: "value"`, do not treat `value` as a field name. Treat it as the `"type"` of another configuration object.',
    '- For `_inheritance`, find the other configuration object whose `"type"` exactly matches the `_inheritance` value.',
    '- Once the `"type"` match is found, inherit only the matched object top-level `core` content.',
    '- For `_inheritance`, ignore the matched object `name`, `description`, labels, titles, ids, and other metadata. Only its top-level `core` content is inherited.',
    '- Then merge the inherited `core` content with the current object own `core` content to build the final type shape.',
    '- The current object own `core` fields are added to the inherited fields. If the same field exists in both, prefer the current object own `core` definition.',
    '- Example: if `item` has `"type": "item"` and `core: { uniqueKey: "string", name: { core: "translation", optional: true } }`, and `potion` has `"type": "potion"`, `_inheritance: "item"`, and `core: { potionValue: "string" }`, then `PotionInterface` or `PotionProps` must contain `uniqueKey: string`, `name?: string`, and `potionValue: string`.',
    '- Inside inherited fields, continue interpreting nested definitions only from their own `core`, `multiple`, and `optional` rules.',
    '- If a field contains a primitive `core`, use the primitive type directly.',
    '- If `"multiple": true`, wrap the final property type in an array.',
    '- If `"optional": true`, mark the property optional with `?`.',
    '- If a field has an object `core`, map it to a nested object shape using its children.',
    '- Prefer inline nested object types such as `{ scenario: string }[]` for nested arrays or one-off nested objects.',
    '- Keep the output focused on the final saved JSON shape, even if the UI uses dropdowns, modals, or lookups to produce the value.',
    'Example of the expected interpretation:',
    'If a form config describes a root type `"dialogue"` with fields like `character: "@go:..."`, `sound: "sound"`, `texts` as a multiple object field containing `content: "translation"` and optional nested arrays like `unlockScenario` with child field `scenario: "@go:..."`, then the generated root interface must describe the final saved JSON as strings for those tagged references.',
    'A valid example output would be:',
    '```ts',
    `export interface Dialogue${rootTypeSuffix} {`,
    '  _id: number;',
    '  _title: string;',
    '  character: string;',
    '  animation: string;',
    '  texts: {',
    '    content: string;',
    '    unlockNoteInspecteur?: { noteInspecteur: string }[];',
    '    unlockScenario?: { scenario: string }[];',
    '    unlockTexts?: { text: string }[];',
    '    unlockCharacter?: { character: string }[];',
    '  }[];',
    '  sound: string;',
    '  responses: string[];',
    '  canShowHistoryResponses: boolean;',
    '}',
    '```',
    'Please output a single `.ts` file exporting only the root interfaces for the provided root object types.',
    'Do not add explanations.',
    'Do not export helper aliases or helper nested interfaces.',
    'Output valid TypeScript only.',
  ].join(' ');

export default class ChatGPTGenerateTypes {
  private buildPersistedTypesMessages = (
    json: any[],
    chatGPTInfos: ChatGPTType,
    rootTypeSuffix: 'Interface' | 'Props' = 'Interface'
  ): ChatCompletionMessageParam[] => {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: buildPersistedTypesSystemPrompt({
          rootTypeSuffix,
        }),
      },
      {
        role: 'user',
        content: [
          'Here is the JSON array of form configurations:',
          '```json',
          JSON.stringify(json, null, 2),
          '```',
        ].join('\n'),
      },
    ];

    if (chatGPTInfos.extraPrompt) {
      messages.push({
        role: 'user',
        content: `Additional generation instructions: ${chatGPTInfos.extraPrompt}\n`,
      });
    }

    if (chatGPTInfos.generationType?.extraPrompt) {
      messages.push({
        role: 'user',
        content: `Additional generation instructions: ${chatGPTInfos.generationType.extraPrompt}\n`,
      });
    }

    return messages;
  };

  savePrevTypes = () => {
    return new Promise<void>((resolve) => {
      const { path } = global;
      const targetFile = pathModule.join(
        path,
        FolderPlugin.gameDevSoftwareDirectory,
        FolderPlugin.typesFiles
      );
      const prevFile = pathModule.join(
        path,
        FolderPlugin.gameDevSoftwareDirectory,
        FolderPlugin.typesFilesSave
      );

      FileService.copyFile(targetFile, prevFile).finally(() => {
        resolve();
      });
    });
  };

  generateTypes = (event: ElectronIpcMainEvent, chatGPTInfos?: ChatGPTType) => {
    if (!chatGPTInfos) {
      LogService.Notify('ChatGPT Api required', { type: 'error' });
      event.reply('chatgpt-generate-types');
      return;
    }
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
        const d =
          `/** Scenes **/` +
          '\n\n' +
          data[0] +
          '\n\n' +
          `/** Game Objects **/` +
          '\n\n' +
          data[1] +
          '\n\n' +
          `/** Constants **/` +
          '\n\n' +
          data[2];
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
            const messages = this.buildPersistedTypesMessages(
              json,
              chatGPTInfos,
              'Interface'
            );
            const temperature = getChatGPTTemperature(chatGPTInfos);

            try {
              // Appel à l’API Chat Completions
              const response = await openAI.chat.completions.create({
                model: chatGPTInfos.model,
                messages,
                ...(typeof temperature === 'number' ? { temperature } : {}),
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
            const messages = this.buildPersistedTypesMessages(
              json,
              chatGPTInfos,
              'Props'
            );
            const temperature = getChatGPTTemperature(chatGPTInfos);

            try {
              // Appel à l’API Chat Completions
              const response = await openAI.chat.completions.create({
                model: chatGPTInfos.model,
                messages,
                ...(typeof temperature === 'number' ? { temperature } : {}),
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
              'You generate TypeScript aliases for constant values saved by the app.',
              'For each object in the array:',
              '- Convert its `"key"` (kebab-case or snake_case) to PascalCase, append `Constant`, and use that as the alias name.',
              '- Map its `"value"` to a TypeScript literal or union type:',
              '  • If the value is an array, emit a union of its elements (e.g. `("a" | "b" | "c")`).',
              '  • If the value is a string, emit a string literal type (e.g. `"foo.png"`).',
              '  • If the value is a number, emit a numeric literal type (e.g. `42`).',
              '- Use the syntax `export type AliasNameConstant = <type>;`.',
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
            content: `Additional generation instructions: ${chatGPTInfos.extraPrompt}\n`,
          });
        }

        if (chatGPTInfos.generationType?.extraPrompt) {
          messages.push({
            role: 'user',
            content: `Additional generation instructions: ${chatGPTInfos.generationType.extraPrompt}\n`,
          });
        }

        try {
          const temperature = getChatGPTTemperature(chatGPTInfos);
          // Appel à l’API Chat Completions
          const response = await openAI.chat.completions.create({
            model: chatGPTInfos.model,
            messages,
            ...(typeof temperature === 'number' ? { temperature } : {}),
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
