import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.feraAPP_API_KEY = await getSecretValue('feraapp_api_key');
  process.env.LEGACY_MYSQL_PASSWORD = await getSecretValue(
    'legacy_mysql_password',
  );
  process.env.LEGACY_MYSQL_UNIX_SOCKET = await getSecretValue(
    'legacy_mysql_unix_socket',
  );
  process.env.LEGACY_MYSQL_USER_NAME = await getSecretValue(
    'legacy_mysql_user_name',
  );
  process.env.MULE_API_CLIENT_ID = await getSecretValue('mule_api_client_id');
  process.env.MULE_API_CLIENT_SECRET = await getSecretValue(
    'mule_api_client_secret',
  );

  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
