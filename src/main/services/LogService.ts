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

  static TerminalMessage(message: string) {
    if (!message.trim()) return;
    const now = new Date();

    // Utilisation de toLocaleDateString et toLocaleTimeString pour formater la date et l'heure en français
    const formattedDate = now.toLocaleDateString('fr-FR'); // format "jj/mm/aaaa"
    const formattedTime = now.toLocaleTimeString('fr-FR'); // format "HH:MM:SS"

    // Concaténation dans le format souhaité
    const fullMessage = `(${formattedDate} ${formattedTime}) ${message}`;
    // @ts-ignore
    const mainWindow = global.mainWindow;
    mainWindow.webContents.send('send-terminal', fullMessage);
  }
}
