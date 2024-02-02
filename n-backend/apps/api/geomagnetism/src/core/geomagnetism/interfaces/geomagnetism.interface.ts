import { HttpStatus } from '@nestjs/common';
import { ServerTimestamp } from 'packages/types/dist/firestore';
/**
 * SONY geomagnetic measurement_certification response / SONY地磁気計測_認証 レスポンス
 */

export interface RequestGeomagneticAuthResponse {
  data: {
    token: string; // Replace 'string' with the actual data type of userIdToken
  };
  message: string;
  code: HttpStatus;
}
/**
 * SONY geomagnetic user registration response / SONY地磁気計測_ユーザー登録 レスポンス
 */
export interface RegistGeomagneticUserResponse {
  data?: GeomagneticID;
  message?: string;
  code?: number;
}

export interface GeomagneticID {
  geomagneticUserId?: string;
}

export interface GeomagneticRegistraion {
  geomagneticUserId?: string;
  updatedBy?: string;
  updatedAt?: ServerTimestamp;
}
