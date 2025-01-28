import childProcess, { ExecException } from 'child_process';
import yaml from 'js-yaml';
import pathModule from 'path';
import FileService from './FileService';
import FolderPlugin from '../plugins/FolderPlugin';
import { ApplicationIdentityParams } from 'types';

const exec = childProcess.exec;

export default class TrapezeService {
  static runTrapeze = (): Promise<ExecException | null> => {
    return new Promise((resolve) => {
      // @ts-ignore
      const path = global.path;
      exec(
        'npx trapeze run app.yaml --android-project android --ios-project ios/App -y',
        { cwd: path },
        (error) => {
          resolve(error);
        }
      );
    });
  };

  static updateIdentity = (
    identity: Pick<
      ApplicationIdentityParams,
      'version' | 'buildVersion' | 'name' | 'package'
    >
  ) => {
    // @ts-ignore
    const path = global.path;
    return FileService.readFile(pathModule.join(path, FolderPlugin.trapezeFile))
      .then((data) => {
        const doc: {
          vars: {
            VERSION: {
              default: string;
            };
            BUILD_NUMBER: {
              default: number;
            };
            DISPLAY_NAME: {
              default: string;
            };
            BUNDLE_ID: {
              default: string;
            };
          };
        } = yaml.load(data) as any;
        const { version, buildVersion, name } = identity;
        doc.vars.VERSION.default = version;
        doc.vars.BUILD_NUMBER.default = Number(buildVersion);
        doc.vars.DISPLAY_NAME.default = name;
        doc.vars.BUNDLE_ID.default = identity.package;

        return Promise.resolve(doc);
      })
      .then((doc) =>
        FileService.writeFile(
          pathModule.join(path, FolderPlugin.trapezeFile),
          yaml.dump(doc)
        )
      );
  };
}
