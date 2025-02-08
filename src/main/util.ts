/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import childProcess, { ExecException } from 'child_process';
import LogService from './services/LogService';
const execProcess = childProcess.exec;

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export const exec = (
  command: string,
  options?: any,
  callback?: (
    error: ExecException | null,
    stdout: Buffer,
    stderr: Buffer
  ) => void
) => {
  const c = (error: ExecException | null, stdout: Buffer, stderr: Buffer) => {
    LogService.TerminalMessage(stdout.toString('utf-8'));
    setTimeout(() => LogService.TerminalMessage(stderr.toString('utf-8')));

    if (error) {
      LogService.Notify(error?.message, {
        type: 'error',
        autoClose: 10000,
        hideProgressBar: true,
      });
    }

    if (callback) {
      callback(error, stdout, stderr);
    }
  };
  if (options) {
    execProcess(command, options, c);
  } else {
    execProcess(command, c);
  }
};
