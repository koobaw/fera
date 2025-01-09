/* eslint-disable turbo/no-undeclared-env-vars */
import { getSecretValue } from './get-secret-value';

export async function loadEnvsForLocal() {
  /**
   * 環境変数の一部がデプロイ時に設定するため、デプロイ前に
   * ローカルテストやcicdの場合、デプロイ時の環境変数と同じものをここ設定
   */
  process.env.feraAPP_API_KEY = await getSecretValue('feraapp_api_key');
  process.env.MULE_ECF_CLIENT_ID = '1234';
  process.env.MULE_ECF_CLIENT_SECRET = 'abcd';
  process.env.AMAZON_PAY_MERCHANT_ID = await getSecretValue(
    'amazonPayMerchantId',
  );
  process.env.AMAZON_PAY_PUBLIC_KEY_ID = await getSecretValue(
    'amazonPayPublicKeyId',
  );
  process.env.AMAZON_PAY_STORE_ID = await getSecretValue('amazonPayStoreId');
  process.env.AMAZON_PAY_MERCHANT_NAME = await getSecretValue(
    'amazonPayMerchantName',
  );
  process.env.AMAZON_PAY_NOTE_TO_BUYER = await getSecretValue(
    'amazonPayNoteToBuyer',
  );
  process.env.AMAZON_PAY_SECRET_KEY = await getSecretValue(
    'amazonPaySecretKey',
  );
  // ローカルテスト時にfirebase-adminのgetAuth()を利用している場合、service_account.jsonを設定する必要があります。
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    '../../../ignores/service_account.json';
}
