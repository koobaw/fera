import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.MULE_CATEGORY_API_CLIENT_ID = await getSecretValue(
    'mule_category_api_client_id',
  );
  process.env.MULE_CATEGORY_API_CLIENT_SECRET = await getSecretValue(
    'mule_category_api_client_secret',
  );

  /**
   * ローカル環境で動作させる場合に必要な環境変数をここで設定
   */
}
