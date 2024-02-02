import { LoggingService } from '@cainz-next-gen/logging';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { loadEnvsForLocal } from './config/load-envs-for-local';
import { FlyerImportService } from './core/flyer-import/flyer-import.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true, // ログを変更する前に吐かれるログ群を保持して、ログ変更時に出力する設定
  });

  // LoggerをCustomLoggerに変更する
  const logger = app.get(LoggingService);
  app.useLogger(logger);

  const env = app.get(ConfigService).get<string>('APP_ENV');

  if (env === 'local') {
    await loadEnvsForLocal();
  }

  const flyerImportService = app.get(FlyerImportService);
  await flyerImportService.import();

  logger.debug('executed.');
  await app.close();
}

bootstrap();
