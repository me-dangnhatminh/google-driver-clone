import 'winston-daily-rotate-file';
import { format, transports } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Logger,
  Inject,
} from '@nestjs/common';

import { ConfigService } from 'src/config';
import { HttpLogging } from './http-logging.middleware';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logConfig = configService.infer('log');

        return {
          level: logConfig.level,
          format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
          ),
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
                format.printf(
                  ({ context, level, timestamp, message, stack }) => {
                    return `${timestamp} [${level}] ${context} - ${message} ${stack ? `\n${stack}` : ''}`;
                  },
                ),
              ),
            }),
            new transports.DailyRotateFile({
              filename: logConfig.filePath,
              level: 'error',
              datePattern: 'YYYY-MM-DD',
              zippedArchive: false,
              maxFiles: '14d',
              format: format.combine(format.timestamp(), format.json()),
            }),
          ],
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule implements NestModule {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger) {
    Logger.overrideLogger(this.logger);
    Logger.log('Overroded default logger', LoggerModule.name);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLogging).forRoutes('*');
  }
}
export default LoggerModule;
