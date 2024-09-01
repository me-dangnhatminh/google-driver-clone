import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: process.env.APP_NAME ?? 'app' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({
          colors: {
            info: 'blue',
            error: 'red',
            warn: 'yellow',
          },
        }),
        format.cli(),
        format.splat(),
        format.timestamp(),
        format.printf(({ level, timestamp, stack, message }) => {
          return `${timestamp} [${level}] ${message} ${stack ? `\n${stack}` : ''}`;
        }),
      ),
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '14d',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '14d',
    }),
  ],
});

export default WinstonModule.createLogger({ instance: logger });
