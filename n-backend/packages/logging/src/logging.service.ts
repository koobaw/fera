import { Logger, transport, createLogger, format } from 'winston';
import { Console } from 'winston/lib/winston/transports';
import { Injectable, LoggerService } from '@nestjs/common';
import { LoggingWinston } from '@google-cloud/logging-winston';

@Injectable()
export class LoggingService implements LoggerService {
  logger: Logger;

  constructor() {
    const logLevel = process.env.APP_ENV === 'prd' ? 'info' : 'debug';

    const outputDest: transport[] = [];
    outputDest.push(
      new Console({
        debugStdout: true,
        handleExceptions: true,
      }),
    );

    if (process.env.APP_ENV !== 'local') {
      outputDest.push(
        new LoggingWinston({
          defaultCallback: (err) => {
            if (err) {
              // eslint-disable-next-line no-console
              console.log(
                `Error occured when try to write log into logging: ${err}`,
              );
            }
          },
        }),
      );
    }

    const logger = createLogger({
      level: logLevel,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({
          stack: true,
        }),
        format.json(),
      ),
      transports: outputDest,
    });

    this.logger = logger;
  }

  error(message: string, trace?: string) {
    if (trace) {
      this.logger.error(`${message}:${trace}`);
    } else {
      this.logger.error(message);
    }
  }

  warn(message: unknown) {
    this.logger.warn(message);
  }

  // as info alias
  log(message: unknown) {
    this.logger.info(message);
  }

  info(message: unknown) {
    this.logger.info(message);
  }

  debug(message: unknown) {
    this.logger.debug(message);
  }

  verbose(message: unknown) {
    this.logger.verbose(message);
  }

  silly(message: unknown) {
    this.logger.silly(message);
  }
}
