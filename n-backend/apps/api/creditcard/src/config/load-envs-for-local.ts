import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.MULE_POCKET_REGI_CLIENT_ID = await getSecretValue(
    'mule_pocket_regi_client_id',
  );
  process.env.MULE_POCKET_REGI_CLIENT_SECRET = await getSecretValue(
    'mule_pocket_regi_client_secret',
  );
  process.env.CRYPTO_KEY = await getSecretValue('crypto_key');
  process.env.CRYPTO_IV = await getSecretValue('crypto_iv');

  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
