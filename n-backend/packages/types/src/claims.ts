export interface Claims {
  userId: string;
  encryptedMemberId?: string;
  accessToken?: string;
  refreshToken?: string;
}
