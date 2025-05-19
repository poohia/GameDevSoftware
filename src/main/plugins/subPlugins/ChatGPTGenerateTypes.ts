import pathModule from 'path';
import fs from 'fs';
import { ChatGPTType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';
import { openAI } from '../ChatGPTPlugin';
import FileService from '../../services/FileService';
import LogService from '../../services/LogService';

export default class ChatGPTGenerateTypes {
  generateTypes = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    let json: any[] = [];
    const gameObjectsPath = pathModule.join(
      path,
      FolderPlugin.gameObjectDirectory
    );
    console.log(
      '🚀 ~ ChatGPTGenerateTypes ~ gameObjectsPath:',
      gameObjectsPath
    );

    fs.readdir(gameObjectsPath, {}, (err, files: string[]) => {
      if (err) {
        return;
      }
      Promise.all(
        files
          .filter((file) => file.includes('.json'))
          .filter((file) => file !== 'index.json')
          .map((file) => {
            return FileService.readJsonFile(
              pathModule.join(path, FolderPlugin.gameObjectDirectory, file)
            );
          })
      )
        .then((results) => {
          console.log(
            '🚀 ~ ChatGPTGenerateTypes ~ .map ~ results:',
            JSON.stringify(results)
          );
          json = results;
          return;
        })
        .then(async () => {
          if (!openAI) {
            event.reply('chatgpt-generate-types');
            return;
          }
          // Prépare la conversation avec un prompt en anglais
          const messages = [
            {
              role: 'system',
              content:
                'You are a helpful assistant that writes clean, idiomatic TypeScript code from JSON data.',
            },
            {
              role: 'user',
              content: [
                'Here is the JSON data:',
                '```json',
                json,
                '```',
                'Please generate a TypeScript module that:',
                '- Defines appropriate interfaces or types for this data,',
                '- Provides a function `parseData()` that takes the raw JSON and returns typed objects,',
                '- Adds a few example usages.',
              ].join('\n'),
            },
          ];

          // Appel à l’API Chat Completions
          const response = await openAI.chat.completions.create({
            model: 'gpt-4o-code',
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

          // Sauvegarde dans un fichier .ts
          //   writeFileSync(outputPath, JSON.parse(code).code);
          LogService.Log(`✅ Code généré ${JSON.parse(code).code}`);
          console.log(`✅ Code généré ${JSON.parse(code).code}`);
        });
    });
  };
}
