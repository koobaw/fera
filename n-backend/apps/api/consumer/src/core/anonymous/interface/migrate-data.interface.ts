export interface MigrateData {
  userType: string;
  myStoreCode: string;
  legacyMemberId: string | null;
  favoriteProductCodes: string[];
  pickupOrderIds: string[];
}
