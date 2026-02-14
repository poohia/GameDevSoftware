import { shell } from 'electron';
import { pathToFileURL } from 'url';

export default class EditorService {
  static async openPathInVSCode(targetPath: string): Promise<boolean> {
    const vscodeUri = pathToFileURL(targetPath)
      .toString()
      .replace('file://', 'vscode://file');
    try {
      await shell.openExternal(vscodeUri);
      return true;
    } catch (_error) {
      return false;
    }
  }
}
