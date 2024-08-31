import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

const APP_NAME = process.env.APP_NAME ?? 'app';

// format: format.combine(
//   format.cli(),
//   format.splat(),
//   format.timestamp(),
//   format.printf(({ level, timestamp, stack, message }) => {
//     return `${timestamp} [${level}] ${stack ?? message}`;
//   }),
// ),
export const logger = createLogger({
  level: 'info',
  defaultMeta: { service: APP_NAME },
  transports: [
    new transports.Console({
      format: format.combine(
        format.cli(),
        format.splat(),
        format.timestamp(),
        format.printf(({ level, timestamp, stack, message }) => {
          return `${timestamp} [${level}] ${stack ?? message}`;
        }),
      ),
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '30d',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '30d',
    }),
  ],
});

export default logger;
