import { createLogger, format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';

export const winstonLogger = WinstonModule.createLogger({
  instance: createLogger({
    format: format.combine(format.timestamp()),
    transports: [
      new transports.Console({
        level: process.env.LOG_LEVEL ?? 'info',
        format: format.combine(
          format.colorize({
            all: true,
            colors: {
              error: 'red',
              warn: 'yellow',
              info: 'green',
              verbose: 'cyan',
              debug: 'blue',
              silly: 'magenta',
            },
          }),
          format.splat(),
          format.printf(({ context, level, timestamp, message, stack }) => {
            return `${timestamp} [${level}] ${context} - ${message} ${stack ? `\n${stack}` : ''}`;
          }),
        ),
      }),
    ],
  }),
});

export default winstonLogger;
