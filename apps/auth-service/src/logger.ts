import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

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
      filename: 'logs/myapp.%DATE%.error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '14d',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/myapp.%DATE%.combined.log',
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      zippedArchive: false,
      maxFiles: '14d',
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        // TODO: Use environment variables
        node: 'http://localhost:9200',
      },
    }),
  ],
});

export default WinstonModule.createLogger({ instance: logger });