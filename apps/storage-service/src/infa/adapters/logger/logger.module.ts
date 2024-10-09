import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import {
  WinstonModule as NestWinston,
  WinstonModuleOptions,
} from 'nest-winston';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HTTPLogger } from './http-logger.middleware';

import { ConfigService } from 'src/config';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: Logger,
      useFactory: (configService: ConfigService) => {
        const logConfig = configService.infer('app.log');
        if (logConfig.enabled === false) return NestWinston.createLogger({});

        const transportsArr: WinstonModuleOptions['transports'] = [];

        const consoleLog = new transports.Console({ level: logConfig.level });
        transportsArr.push(consoleLog);

        if (logConfig.accessFile) {
          const fileLog = new transports.DailyRotateFile({
            filename: logConfig.filePath,
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxFiles: '14d',
          });
          transportsArr.push(fileLog);
        }

        return NestWinston.createLogger({
          instance: createLogger({
            format: format.combine(
              format.timestamp(),
              format.errors({ stack: true }),
              format.colorize({
                all: true,
                level: true,
                message: true,
                colors: {
                  info: 'green',
                  error: 'red',
                  debug: 'blue',
                  warn: 'yellow',
                  verbose: 'cyan',
                },
              }),
              format.printf(({ context, level, timestamp, message, stack }) => {
                return `${timestamp} [${level}] ${context} - ${message} ${stack ? `\n${stack}` : ''}`;
              }),
            ),
            transports: transportsArr,
          }),
        });
      },
    },
  ],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
export default LoggerModule;
