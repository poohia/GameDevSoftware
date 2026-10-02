import { BrowserWindow } from 'electron';

export default class LocalStorageIframePlugin {
  private static readonly VIEW_ORIGIN = 'http://localhost:3333';
  private static readonly GAME_STORAGE_KEY = 'game';
  private static readonly VIEW_STORAGE_GAME_ENDED = 'game-ended';
  private static readonly VIEW_STORAGE_GAME_ENDED_ONCE =
    'game-already-ended-once';

  private readonly debuggerVersion = '1.3';

  constructor(private mainWindow: BrowserWindow) {}

  resetGameData = async () => {
    const { webContents } = this.mainWindow;
    const debuggerWasAttached = webContents.debugger.isAttached();

    try {
      if (!debuggerWasAttached) {
        webContents.debugger.attach(this.debuggerVersion);
      }

      await webContents.debugger.sendCommand('DOMStorage.enable');
      await webContents.debugger.sendCommand(
        'DOMStorage.removeDOMStorageItem',
        {
          storageId: {
            securityOrigin: LocalStorageIframePlugin.VIEW_ORIGIN,
            isLocalStorage: true,
          },
          key: LocalStorageIframePlugin.GAME_STORAGE_KEY,
        }
      );
      await webContents.debugger.sendCommand(
        'DOMStorage.removeDOMStorageItem',
        {
          storageId: {
            securityOrigin: LocalStorageIframePlugin.VIEW_ORIGIN,
            isLocalStorage: true,
          },
          key: LocalStorageIframePlugin.VIEW_STORAGE_GAME_ENDED,
        }
      );
      await webContents.debugger.sendCommand(
        'DOMStorage.removeDOMStorageItem',
        {
          storageId: {
            securityOrigin: LocalStorageIframePlugin.VIEW_ORIGIN,
            isLocalStorage: true,
          },
          key: LocalStorageIframePlugin.VIEW_STORAGE_GAME_ENDED_ONCE,
        }
      );
    } catch (error: any) {
      if (
        typeof error?.message === 'string' &&
        error.message.includes('Storage not found')
      ) {
        return false;
      }
      throw error;
    } finally {
      if (!debuggerWasAttached && webContents.debugger.isAttached()) {
        webContents.debugger.detach();
      }
    }

    return true;
  };

  resetViewDatabase = async () => {
    await this.mainWindow.webContents.session.clearStorageData({
      origin: LocalStorageIframePlugin.VIEW_ORIGIN,
      storages: ['localstorage'],
    });

    return true;
  };
}
