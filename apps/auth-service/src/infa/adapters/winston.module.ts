import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import { WinstonModule as NestWinston } from 'nest-winston';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: Logger,
      useFactory: (configService: ConfigService) => {
        const app = configService.get('app', { infer: true });
        console.log(app);
        return NestWinston.createLogger({
          instance: createLogger({
            level: process.env.LOG_LEVEL ?? 'info',
            defaultMeta: { service: process.env.APP_NAME ?? 'app' },
            transports: [
              new transports.Console({
                format: format.combine(
                  format.colorize({
                    all: true,
                    colors: {
                      info: 'green',
                      error: 'red',
                      debug: 'purple',
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
                filename: 'logs/%DATE%.error.log',
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                format: format.combine(format.timestamp(), format.json()),
                zippedArchive: false,
                maxFiles: '14d',
              }),
              new transports.DailyRotateFile({
                filename: 'logs/%DATE%.combined.log',
                level: 'info',
                datePattern: 'YYYY-MM-DD',
                format: format.combine(format.timestamp(), format.json()),
                zippedArchive: false,
                maxFiles: '14d',
              }),
            ],
          }),
        });
      },
    },
  ],
})
export class WinstonModule {}
export default WinstonModule;
