import { ToastContent, ToastOptions } from 'react-toastify';

export default class LogService {
  static Log(message: any) {
    // @ts-ignore
    const mainWindow = global.mainWindow;
    mainWindow.webContents.send('send-log', message);
  }

  static Notify(content: ToastContent<string>, options?: ToastOptions<any>) {
    // @ts-ignore
    const mainWindow = global.mainWindow;
    mainWindow.webContents.send('send-notification', {
      content,
      options,
    });
  }
}
