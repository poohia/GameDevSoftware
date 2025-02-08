import yaml from 'js-yaml';
import pathModule from 'path';
import FileService from './FileService';
import FolderPlugin from '../plugins/FolderPlugin';
import { ApplicationConfigJson, ApplicationIdentityParams } from 'types';
import { ExecException } from 'child_process';
import { exec } from '../util';

type TrapezeAppDoc = {
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
  platforms: {
    ios: {
      targets: {
        App: {
          plist: {
            entries: Array<{
              [key: string]: string[] | boolean | string;
            }>;
          };
        };
      };
    };
  };
};

enum ScreenOrientationIos {
  UIInterfaceOrientationPortrait = 'UIInterfaceOrientationPortrait',
  UIInterfaceOrientationPortraitUpsideDown = 'UIInterfaceOrientationPortraitUpsideDown',
  UIInterfaceOrientationLandscapeLeft = 'UIInterfaceOrientationLandscapeLeft',
  UIInterfaceOrientationLandscapeRight = 'UIInterfaceOrientationLandscapeRight',
}

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
        const doc: TrapezeAppDoc = yaml.load(data) as any;
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
  static updateOrientation = (
    orientation: ApplicationConfigJson['screenOrientation']
  ) => {
    // @ts-ignore
    const path = global.path;

    return FileService.readFile(pathModule.join(path, FolderPlugin.trapezeFile))
      .then((data) => {
        const doc: TrapezeAppDoc = yaml.load(data) as any;

        const findEntry = (key: string) =>
          doc.platforms.ios.targets.App.plist.entries.find(
            (entry: any) => key in entry
          );

        const updateEntry = (key: string, value: any) => {
          const entry = findEntry(key);
          if (entry) {
            entry[key] = value;
          } else {
            doc.platforms.ios.targets.App.plist.entries.push({ [key]: value });
          }
        };

        let orientations;
        switch (orientation) {
          case 'any':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationLandscapeLeft,
              ScreenOrientationIos.UIInterfaceOrientationLandscapeRight,
              ScreenOrientationIos.UIInterfaceOrientationPortrait,
              ScreenOrientationIos.UIInterfaceOrientationPortraitUpsideDown,
            ];
            break;
          case 'landscape':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationLandscapeLeft,
              ScreenOrientationIos.UIInterfaceOrientationLandscapeRight,
            ];
            break;
          case 'landscape-primary':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationLandscapeLeft,
            ];
            break;
          case 'landscape-secondary':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationLandscapeRight,
            ];
            break;
          case 'portrait':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationPortrait,
              ScreenOrientationIos.UIInterfaceOrientationPortraitUpsideDown,
            ];
            break;
          case 'portrait-primary':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationPortrait,
            ];
            break;
          case 'portrait-secondary':
            orientations = [
              ScreenOrientationIos.UIInterfaceOrientationPortraitUpsideDown,
            ];
            break;
        }

        // Mettre à jour les entrées YAML
        updateEntry('UISupportedInterfaceOrientations', orientations);
        updateEntry('UISupportedInterfaceOrientations~ipad', orientations);

        console.log(
          '🚀 Updated entries:',
          doc.platforms.ios.targets.App.plist.entries
        );

        return Promise.resolve(doc);
      })
      .then((doc) => {
        const yamlContent = yaml.dump(doc, { noRefs: true }); // Désactive les références
        return FileService.writeFile(
          pathModule.join(path, FolderPlugin.trapezeFile),
          yamlContent
        );
      });
  };
}
