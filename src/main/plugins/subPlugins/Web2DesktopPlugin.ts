import { ApplicationIdentityParams, ApplicationWeb2DesktopParams } from 'types';
import pathModule from 'path';
import FileService from '../../services/FileService';
import FolderPlugin from '../FolderPlugin';

export default class Web2DesktopPlugin {
  writeWeb2DesktopConfig = (args: ApplicationIdentityParams) => {
    const { path } = global;
    const configPath = pathModule.join(
      path,
      FolderPlugin.web2desktopConfigFiles[0]
    );
    return FileService.createFileIfNotExist(configPath, '{}')
      .then(() => FileService.readJsonFile(configPath))
      .then((data) => {
        const nextData = {
          ...data,
          name: args.name,
          build: {
            ...(data.build || {}),
            appBundleId: args.package,
            version: args.version,
            author: args.authorName,
            maintainerEmail: args.authorEmail,
          },
        };
        return FileService.writeJsonFile(configPath, nextData);
      });
  };

  private readWeb2DesktopConfig = () => {
    const { path } = global;
    const configPath = pathModule.join(
      path,
      FolderPlugin.web2desktopConfigFiles[0]
    );
    return FileService.createFileIfNotExist(configPath, '{}').then(() =>
      FileService.readJsonFile(configPath)
    );
  };

  private writeWeb2DesktopConfigFile = (data: any) => {
    const { path } = global;
    return FileService.writeJsonFile(
      pathModule.join(path, FolderPlugin.web2desktopConfigFiles[0]),
      data
    );
  };

  loadWeb2DesktopParams = (): Promise<ApplicationWeb2DesktopParams> =>
    this.readWeb2DesktopConfig().then((data) => ({
      themeSource: data.themeSource || 'system',
      fullScreen: data.fullScreen ?? false,
      resizable: data.resizable ?? false,
      closable: data.closable ?? false,
      copyright: data.build?.copyright || '',
      windowsCertificateFile:
        data.build?.windows?.signature?.certificateFile || '',
      windowsCertificatePassword:
        data.build?.windows?.signature?.certificatePassword || '',
      appleId: data.build?.apple?.signature?.appleId || '',
      appleIdPassword: data.build?.apple?.signature?.appleIdPassword || '',
      appleIdentity: data.build?.apple?.signature?.identity || '',
      appleTeamId: data.build?.apple?.signature?.teamId || '',
      steamAppId: data.plugins?.Steam?.appId ?? null,
    }));

  writeWeb2DesktopParams = (args: ApplicationWeb2DesktopParams) => {
    return this.readWeb2DesktopConfig().then((data) => {
      const nextData = {
        ...data,
        themeSource: args.themeSource,
        fullScreen: args.fullScreen,
        resizable: args.resizable,
        closable: args.closable,
        build: {
          ...(data.build || {}),
          copyright: args.copyright,
          windows: {
            ...(data.build?.windows || {}),
            signature: {
              ...(data.build?.windows?.signature || {}),
              certificateFile: args.windowsCertificateFile,
              certificatePassword: args.windowsCertificatePassword,
            },
          },
          apple: {
            ...(data.build?.apple || {}),
            signature: {
              ...(data.build?.apple?.signature || {}),
              appleId: args.appleId,
              appleIdPassword: args.appleIdPassword,
              identity: args.appleIdentity,
              teamId: args.appleTeamId,
            },
          },
        },
        plugins: {
          ...(data.plugins || {}),
          Steam: {
            ...(data.plugins?.Steam || {}),
            appId: args.steamAppId,
          },
        },
      };
      return this.writeWeb2DesktopConfigFile(nextData);
    });
  };
}
