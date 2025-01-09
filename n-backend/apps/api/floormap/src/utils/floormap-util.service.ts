import { Injectable, HttpStatus } from '@nestjs/common';
import { LoggingService } from '@fera-next-gen/logging';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';
import { MuleErrorResponse } from '../core/floormap/interface/floormap.interface';

@Injectable()
export class FloorMapUtilService {
  STORAGE_API_BASE_URL = 'https://firebasestorage.googleapis.com';

  STORAGE_API_VERSION = 'v0';

  constructor(
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
  ) {}

  /**
 * Converts a CSV string into an array by splitting it at commas.
 * If the input string is empty or undefined, an empty array is returned.
 * CSV 文字列をカンマで分割して配列に変換します。
* 入力文字列が空または未定義の場合、空の配列が返されます。

 * @param csvString - The CSV string to convert into an array. / 配列に変換する CSV 文字列。
 * @returns An array containing the elements extracted from the CSV string. / CSV 文字列から抽出された要素を含む配列。
 */
  public convertToArray(csvString: string) {
    // Check if csvString is defined and not empty / csvString が定義されており、空でないことを確認する
    if (csvString) {
      const array = csvString.split(','); // Split the string by commas / 文字列をカンマで区切る
      return array;
    }
    return []; // Return an empty array if the input is empty / 入力が空の場合は空の配列を返します
  }

  /**
   * Retrieves the product location details from MySQL database based on the current environment.
   * 現在の環境に基づいて、MySQL データベースから製品の場所の詳細を取得します。
   *
   * @param query - The query to be inserted. / 挿入するクエリ
   * @returns String value with product location details / 製品の場所の詳細を含む文字列値
   */
  public getQuery(query: string): string {
    return `${query} SELECT
    sls.prd_cd AS prd_cd,
    sf.name AS name,
    sf.sheet_name AS title,
    sf.url AS url,
    sg.data AS data
  FROM shelf_location_sm sls
  INNER JOIN
  (
    SELECT
      hojin_cd,
      tenpo_cd,
      gondola_no_tana,
      MAX(if_renkei_ymd) AS if_renkei_ymd_max
      FROM shelf_location_sm as sls_a
      WHERE hojin_cd = ?
        AND tenpo_cd = ?
        AND (tanawari_ptn_tekiyo_from_ymd <= DATE_FORMAT(NOW(),'%Y%m%d')
          OR tanawari_ptn_tekiyo_from_ymd IS NULL)
        AND gondola_no_tana IN (
          SELECT DISTINCT
            gondola_no_tana
          FROM shelf_location_sm as sls_b
          WHERE hojin_cd = ?
            AND tenpo_cd = ?
            AND prd_cd IN (?)
            AND (tanawari_ptn_tekiyo_from_ymd <= DATE_FORMAT(NOW(), '%Y%m%d')
                  OR tanawari_ptn_tekiyo_from_ymd IS NULL)
        )
      GROUP BY hojin_cd, tenpo_cd, gondola_no_tana
  ) sls_available
    ON sls_available.hojin_cd = sls.hojin_cd
    AND sls_available.if_renkei_ymd_max = sls.if_renkei_ymd
    AND sls_available.tenpo_cd = sls.tenpo_cd
    AND sls_available.gondola_no_tana = sls.gondola_no_tana
  INNER JOIN svg_file AS sf
    ON sf.shop_id = LPAD(sls.tenpo_cd, 4, '0')
  LEFT JOIN svg_gondola AS sg
    ON sg.svg_name = sf.name
    AND sg.id = SUBSTRING(sls.gondola_no_tana, 1, 7)
  INNER JOIN item_master AS im
    ON im.hojin_cd = sls.hojin_cd
    AND im.prd_cd = sls.prd_cd
  LEFT JOIN item_master AS im2
    ON im2.hojin_cd = im.hojin_cd
    AND im2.prd_no = im.prd_no
    AND im.prd_no_br_no < im2.prd_no_br_no
  INNER JOIN store_item AS si
    ON si.hojin_cd = im.hojin_cd
    AND si.prd_no = im.prd_no
    AND si.prd_no_br_no = im.prd_no_br_no
    AND si.tenpo_cd = sls.tenpo_cd
  WHERE sls.prd_cd IN (?)
    AND sls.del_flg = '0'
    AND sls.tenpo_cd = ?
    AND im2.prd_no_br_no IS NULL
  GROUP BY sls.prd_cd, sf.name, sf.sheet_name, sf.url, sg.data;`;
  }

  /**
   * Retrieves the store map from MySQL database based on the current environment.
   * 現在の環境に基づいて MySQL データベースからストア マップを取得します。
   *
   * @param query - The query to be inserted. / 挿入するクエリ
   * @returns String value with store map / ストアマップを含む文字列値
   */
  public getQueryWithoutProducts(query: string): string {
    return `${query} SELECT DISTINCT
    sf.url AS url,
    sf.name AS name,
    sf.sheet_name AS title
  FROM shelf_location_sm sls
  INNER JOIN
  (
    SELECT
      hojin_cd,
      tenpo_cd,
      gondola_no_tana,
      MAX(if_renkei_ymd) AS if_renkei_ymd_max
      FROM shelf_location_sm as sls_a
      WHERE hojin_cd = ?
        AND tenpo_cd = ?
        AND gondola_no_tana IN (
          SELECT DISTINCT
            gondola_no_tana
          FROM shelf_location_sm as sls_b
          WHERE hojin_cd = ?
            AND tenpo_cd = ?
            AND (tanawari_ptn_tekiyo_from_ymd <= DATE_FORMAT(NOW(), '%Y%m%d')
                  OR tanawari_ptn_tekiyo_from_ymd IS NULL)
        )
      GROUP BY hojin_cd, tenpo_cd, gondola_no_tana
  ) sls_available
    ON sls_available.hojin_cd = sls.hojin_cd
    AND sls_available.if_renkei_ymd_max = sls.if_renkei_ymd
    AND sls_available.tenpo_cd = sls.tenpo_cd
    AND sls_available.gondola_no_tana = sls.gondola_no_tana
  INNER JOIN svg_file AS sf
    ON sf.shop_id = LPAD(sls.tenpo_cd, 4, '0')
  LEFT JOIN svg_gondola AS sg
    ON sg.svg_name = sf.name
    AND sg.id = SUBSTRING(sls.gondola_no_tana, 1, 7)
  WHERE sls.del_flg = '0'
    AND sls.tenpo_cd = ?
  GROUP BY sf.name, sf.sheet_name, sf.url;`;
  }

  /**
   * Retrieves the database configuration for the legacy MySQL database based on the current environment.
   * 現在の環境に基づいて、レガシー MySQL データベースのデータベース設定を取得します。
   *
   * @returns Database configuration object with connection details. / 接続の詳細を持つデータベース設定オブジェクト。
   */
  public getLegacyDbConfig() {
    this.logger.debug('start legacy databse configuration');
    // Get the current application environment. / 現在のアプリケーション環境を取得します。
    const currentEnv = this.env.get<string>('APP_ENV');
    // Define the base database configuration with common parameters. / 共通のパラメータを持つベースのデータベース設定を定義します。
    const baseDbConfig = {
      user: this.env.get<string>('LEGACY_MYSQL_USER_NAME'),
      database: this.env.get<string>('LEGACY_MYSQL_DB_NAME'),
      password: this.env.get<string>('LEGACY_MYSQL_PASSWORD'),
    };

    let connection: object;

    if (currentEnv === 'local') {
      // In the local environment, use a host-based connection. / ローカル環境では、ホストベースの接続を使用します。
      connection = {
        host: this.env.get<string>('LEGACY_MYSQL_ADDRESS'),
      };
    } else {
      // In the cloud run environment, use a socket path-based connection. / Cloud Run 環境では、ソケットパスベースの接続を使用します。
      connection = {
        socketPath: this.env.get<string>('LEGACY_MYSQL_UNIX_SOCKET'),
      };
    }
    // Combine the base database configuration with the connection details. / ベースのデータベース設定と接続の詳細を組み合わせます。
    const dbConfig = {
      ...baseDbConfig,
      ...connection,
    };
    this.logger.debug('end legacy databse configuration');
    return dbConfig;
  }

  /**
   * Compares two strings considering them as numbers by removing non-digit characters.
   * 非数字の文字を削除して、二つの文字列を数字として比較します。
   *
   * @param substring - The substring to be compared. / 比較される部分文字列。
   * @param mainString - The main string for the comparison. / 比較の主な文字列。
   * @returns True if the digits in the substring match any part of the main string, otherwise false.
   * @returns サブストリングの中の数字がメインの文字列のいずれかの部分と一致する場合はtrue、それ以外の場合はfalse。
   */
  public compareProductIds(substring: string, mainString: string): boolean {
    // Remove non-digit characters / 非数字の文字を削除する
    return mainString.indexOf(substring) !== -1;
  }

  /**
   * Error handling / エラー処理
   * @param { AxiosError } error error object from mule api / Mule API からのエラー オブジェクト
   * @returns the error object with code, message and status /
   * コード、メッセージ、ステータスを含むエラー オブジェクト
   */
  public handleException(error: AxiosError) {
    const errorObject: MuleErrorResponse = error.response.data;

    let errorCode: string;
    let statusCode: number;

    if (!error.response) {
      errorCode = ErrorCode.MULE_API_SERVER_ERROR;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (errorObject.status === 500 && errorObject.errors) {
      errorCode = ErrorCode.GMO_ERROR;
    } else if (error.response.status === 401) {
      errorCode = ErrorCode.MULE_API_UNAUTHORIZED_ACCESS;
    } else {
      errorCode = ErrorCode.MULE_API_BAD_REQUEST;
    }

    return {
      errCode: errorCode,
      errMessage: ErrorMessage[errorCode],
      status: error.response.status ? error.response.status : statusCode,
    };
  }

  /**
   * Generates the full URL for accessing a floor guide file based on the provided file path.
   * フロアガイドファイルにアクセスするための完全なURLを生成します。
   *
   * @param floorGuideFilePath - The file path of the floor guide within the storage bucket. / ストレージバケット内のフロアガイドのファイルパス。
   * @returns The full URL for accessing the floor guide file. / フロアガイドファイルにアクセスするための完全なURL。
   */
  public getFullUrl(floorGuideFilePath: string): string {
    // Retrieve the storage bucket from the environment variables. / 環境変数からストレージバケットを取得します。
    const bucket = this.env.get<string>('FLOOR_MAP_BUCKET');

    // Construct the full URL with the necessary parameters for accessing the file from the storage bucket.
    // ストレージバケットからファイルにアクセスするための必要なパラメータを含む完全なURLを構築します。
    const floorGuideUrl =
      `${this.STORAGE_API_BASE_URL}/${this.STORAGE_API_VERSION}` +
      `/b/${bucket}/o/${encodeURIComponent(floorGuideFilePath)}?alt=media`;

    // Return the generated full URL. / 生成された完全なURLを返します。
    return floorGuideUrl;
  }
}
