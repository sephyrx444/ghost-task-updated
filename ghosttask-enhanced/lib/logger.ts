export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private format(level: LogLevel, message: string, meta?: any): string {
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${this.getTimestamp()}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  public info(message: string, meta?: any): void {
    console.log(this.format('info', message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.format('warn', message, meta));
  }

  public error(message: string, error?: any, meta?: any): void {
    const errMeta = error instanceof Error 
      ? { ...meta, name: error.name, message: error.message, stack: error.stack }
      : { ...meta, rawError: error };
    console.error(this.format('error', message, errMeta));
  }

  public debug(message: string, meta?: any): void {
      console.log(this.format('debug', message, meta));
  }
}

export const logger = new Logger();
