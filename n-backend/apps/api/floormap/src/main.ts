import cluster from 'cluster';
import os from 'os';

import { CommonService } from '@fera-next-gen/common';
import { HttpExceptionFilter } from '@fera-next-gen/exception';
import { LoggingService } from '@fera-next-gen/logging';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { initializeApp } from 'firebase-admin/app';
import { AppModule } from './app.module';
import { loadEnvsForLocal } from './config/load-secrets-for-local';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // ログを変更する前に吐かれるログ群を保持して、ログ変更時に出力する設定
  });
  const port = 8080;

  app.setGlobalPrefix('/v1/floormap');

  // LoggerをCustomLoggerに変更する
  const logger = app.get(LoggingService);
  app.useLogger(logger);

  // validate
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 全ての例外レスポンスをカスタマイズする
  app.useGlobalFilters(new HttpExceptionFilter(logger, app.get(CommonService)));

  const env = app.get(ConfigService).get<string>('APP_ENV');

  app.enableCors();

  switch (env) {
    case 'local':
      await loadEnvsForLocal();

      await app.listen(port);
      break;
    default:
      if (cluster.isPrimary) {
        // 親
        const cpus = os.cpus().length;
        for (let i = 0; i < cpus; i++) {
          cluster.fork();
        }

        cluster.on('exit', () => {
          cluster.fork();
        });
      } else {
        // 子
        await app.listen(port);
      }
  }
  // firebsaeを初期化する
  initializeApp();
  logger.log(`App listening on ::${port}`);
}

bootstrap();
