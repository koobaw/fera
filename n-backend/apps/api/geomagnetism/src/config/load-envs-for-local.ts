import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.GEO_ACC_NUMBER = await getSecretValue('geo_acc_number');
  process.env.GEO_ADMIN_USER_NAME = await getSecretValue('geo_admin_user_name');
  process.env.GEO_ADMIN_PSWD = await getSecretValue('geo_admin_pswd');
  process.env.GEO_ACC_ID = await getSecretValue('geo_acc_id');
  process.env.GEO_GRP_ID = await getSecretValue('geo_grp_id');
  process.env.GEO_X_API_KEY = await getSecretValue('geo_x_api_key');
  process.env.GEO_HMAC_SECRET_KEY = await getSecretValue('geo_hmac_secret_key');

  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
