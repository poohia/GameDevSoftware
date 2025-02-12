import { Menu, shell, BrowserWindow, dialog } from 'electron';
import { FolderPlugin } from './plugins';
import { store } from './main';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const menu = Menu.buildFromTemplate(this.buildDefaultTemplate());
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDefaultTemplate() {
    const fileMenu = {
      label: '&File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'Command+O',
          click: () => {
            dialog
              .showOpenDialog(this.mainWindow, {
                properties: ['openDirectory'],
              })
              .then((result) => {
                const path = result.filePaths[0];
                if (FolderPlugin.validePath(path)) {
                  this.mainWindow.webContents.send('set-path', path);
                  this.mainWindow.webContents.send('path-is-correct', path);
                  FolderPlugin.saveGlobalPath(path);
                }
              });
            this.mainWindow.webContents.send('open-path');
          },
        },
        {
          label: '&Close',
          accelerator: 'Command+W',
          click: () => {
            this.mainWindow.close();
          },
        },
      ],
    };
    const editMenu = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };

    const viewMenu = {
      label: '&View',
      submenu:
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true' ||
        true
          ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  store.set('bounds', this.mainWindow.getBounds());
                  store.set(
                    'devToolsOpenned',
                    this.mainWindow.webContents.isDevToolsOpened()
                  );
                  this.mainWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'Ctrl+Command+F',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator:
                  process.platform === 'darwin' ? 'Command+G' : 'Ctrl+G',
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                  setTimeout(() => {
                    store.set(
                      'devToolsOpenned',
                      this.mainWindow.webContents.isDevToolsOpened()
                    );
                  }, 400);
                },
              },
            ]
          : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'Ctrl+Command+F',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
            ],
    };

    const helpMenu = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    return [fileMenu, editMenu, viewMenu, helpMenu];
  }
}
