import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  // load sample
  // process.env.ENV_NAME = await getSecretValue('env_name');

  /**
   * ローカル環境で動作させる場合に必要な環境変数をここで設定
   */
  process.env.CRYPTO_KEY = await getSecretValue('crypto_key');
  process.env.CRYPTO_IV = await getSecretValue('crypto_iv');
  process.env.feraAPP_API_KEY = await getSecretValue('feraapp_api_key');
  process.env.PROJECT_ID = 'fera-feraapp-backend-dev';

  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
