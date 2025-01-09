import { env } from 'process';

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * Secret Managerから秘密情報を取得する
 */
export async function getSecretValue(secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  const projectId = env.PROJECT_ID || 'fera-feraapp-backend-dev';

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });
  const data: string | undefined = version?.payload?.data?.toString();
  if (typeof data === 'undefined') {
    return '';
  }
  return data as string;
}
