export enum ErrorCode {
  // Anonymous Migrate API as example
  ANONYMOUS_MIGRATE_INVALID_USER = 'ANONYMOUS_MIGRATE_1000',
  // Parameter Validation
  PARAM_BAD_PARAMETER_IS_WEB = 'PARAM_1000',

  // SONY geomagnetism user registration authentication failure / SONY地磁気計測_ユーザー登録 認証失敗
  RegistGeomagneticUser_AuthenticationFailed = 'GEOMAGNETIC_REGISTER_15001',
  // SONY geomagnetism user registration SignInUser failed / SONY地磁気計測_ユーザー登録 SignInUser失敗
  RegistGeomagneticUser_SignInUserFailed = 'GEOMAGNETIC_REGISTER_15002',
  // SONY geomagnetism user registration Authorize2 failure / SONY地磁気計測_ユーザー登録 Authorize2失敗
  RegistGeomagneticUser_Authorize2Failed = 'GEOMAGNETIC_REGISTER_15003',
  // SONY geomagnetism User registration GetUserByName failure / SONY地磁気計測_ユーザー登録 GetUserByName失敗
  RegistGeomagneticUser_UsernameFailed = 'GEOMAGNETIC_REGISTER_15004',
  // SONY geomagnetism user registration password generation failure / SONY地磁気計測_ユーザー登録 パスワード生成失敗
  RegistGeomagneticUser_PasswordGenerationFailed = 'GEOMAGNETIC_REGISTER_15005',
  // SONY geomagnetism user registration RegisterUser failure / SONY地磁気計測_ユーザー登録 RegisterUser失敗
  RegistGeomagneticUser_RegisterUserFailed = 'GEOMAGNETIC_REGISTER_15006',

  // SONY Geomagnetism Authentication Authentication failure / SONY地磁気計測_認証 認証失敗
  RequestGeomagneticAuth_AuthenticationFailed = 'GEOMAGNETIC_AUTH_16001',
  // SONY Geomagnetism Authentication SignInUser failure / SONY地磁気計測_認証 SignInUser失敗
  RequestGeomagneticAuth_SignInUserFailed = 'GEOMAGNETIC_AUTH_16002',
  // SONY geomagnetism authentication Authorize2 failed / SONY地磁気計測_認証 Authorize2失敗
  RequestGeomagneticAuth_Authorize2Failed = 'GEOMAGNETIC_AUTH_16003',
  // SONY geomagnetism authentication password generation failure / SONY地磁気計測_認証 パスワード生成失敗
  RequestGeomagneticAuth_PasswordGenerationFailed = 'GEOMAGNETIC_AUTH_16004',

  // GeomagneticID To Firestore insertion failure
  GeomagneticID_TO_Firestore = 'GEOMAGNETIC_ID_DB_1000',
}

export const ErrorMessage = {
  // Anonymous Migrate API as example
  [ErrorCode.ANONYMOUS_MIGRATE_INVALID_USER]: 'invalid user',
  // Authentication Failed
  [ErrorCode.RegistGeomagneticUser_AuthenticationFailed]:
    'Authentication failed',
  // Signin Failed
  [ErrorCode.RegistGeomagneticUser_SignInUserFailed]: 'Signin failed',
  // GeomagneticID To Database insertion failure
  [ErrorCode.GeomagneticID_TO_Firestore]: 'Geomagnetic ID insertion failed',
  // Parameter Validation
  [ErrorCode.PARAM_BAD_PARAMETER_IS_WEB]: 'is_web value must be 1 or 0',
};
