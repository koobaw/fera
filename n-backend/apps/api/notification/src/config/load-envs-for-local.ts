import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.MULE_API_CLIENT_ID = await getSecretValue('mule_api_client_id');
  process.env.MULE_API_CLIENT_SECRET = await getSecretValue(
    'mule_api_client_secret',
  );
  process.env.CC_CLIENT_ID = await getSecretValue('cc_client_id');
  process.env.CC_ACCESS_KEY = await getSecretValue('cc_access_key');
  process.env.feraAPP_API_KEY = await getSecretValue('feraapp_api_key');

  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
