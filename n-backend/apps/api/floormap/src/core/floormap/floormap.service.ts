import { LoggingService } from '@cainz-next-gen/logging';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';
import { CommonService } from '@cainz-next-gen/common';
import { HttpService } from '@nestjs/axios';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  CombinedData,
  Gondola,
  TransformedLocation,
  TransformedProduct,
} from './interface/floormap.interface';
import { FloorMapUtilService } from '../../utils/floormap-util.service';

@Injectable()
export class FloormapService {
  COMPANY_CODE = '24';

  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly floorMapUtilService: FloorMapUtilService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Retrieve floor map data from a legacy database based on product IDs and Store Code. /
   * 製品 ID とショップ Code に基づいて、レガシー データベースからフロア マップ データを取得します。
   *
   * @param productIdArray - An array of product IDs to filter the data by. / データをフィルタリングするための製品 ID の配列。
   * @param storeCode - The Code of the store to retrieve data for. / データを取得するショップのCode。
   * @returns A Promise that resolves to an array of floor map data. / フロア マップ データの配列に解決される Promise。
   */
  public async getFloorMapDataFromDB(
    productIdArray: string[],
    storeCode: string,
  ) {
    this.logger.debug('start get data from legacy DB');

    const dbConfig = this.floorMapUtilService.getLegacyDbConfig();

    let data = [];
    let connection;
    try {
      // Create a database connection using the provided configuration / 提供された設定を使用してデータベース接続を作成
      connection = await mysql.createConnection(dbConfig);
      // Get the SQL query for retrieving floor map data / フロアマップデータを取得するためのSQLクエリを取得

      const sql =
        productIdArray.length === 0
          ? this.floorMapUtilService.getQueryWithoutProducts()
          : this.floorMapUtilService.getQuery();
      const finalSql: string = sql.replace(
        /IN \(\?\)/g,
        `IN ('${productIdArray.join("','")}')`,
      );

      // Define the parameters for the SQL query / SQLクエリのパラメータを定義
      const queryParams = [
        this.COMPANY_CODE,
        Number(storeCode),
        this.COMPANY_CODE,
        Number(storeCode),
        Number(storeCode),
      ];
      // Execute the SQL query with the specified parameters / 指定されたパラメータでSQLクエリを実行
      const [rows] = await connection.execute(finalSql, queryParams);

      // Convert the result into an array and store it in the 'data' variable / 結果を配列に変換し、'data'変数に格納
      data = Object.values(JSON.parse(JSON.stringify(rows)));
    } catch (e) {
      this.commonService.logException(
        `import  error. failed to connect legacy DB`,
        e,
      );
      // Create an HTTP exception with appropriate error codes and status / 適切なエラーコードとステータスを持つHTTP例外を生成
      this.commonService.createHttpException(
        ErrorCode.FlOOR_MAP_CONNECT_LEGACY_DB,
        ErrorMessage[ErrorCode.FlOOR_MAP_CONNECT_LEGACY_DB],
        HttpStatus.FORBIDDEN,
      );
    } finally {
      // Close the database connection, whether an exception occurred or not / 例外が発生しているかどうかに関係なくデータベース接続を閉じる
      connection.end();
    }
    let transformLocations = [];
    if (productIdArray.length !== 0) {
      const locations = await this.fetchLocations(productIdArray, storeCode);
      transformLocations = this.transformLocation(locations);
    }
    // Create a set of existing prd_cd values / 既存の prd_cd 値のセットを作成する
    const existingPrdCodes = new Set(data.map((item) => item.prd_cd));
    let counter = 1;
    // Check and add missing values / 欠損値を確認して追加する
    productIdArray.forEach((productId) => {
      if (!existingPrdCodes.has(productId)) {
        const newObj = {
          prd_cd: productId,
          url: `undefined ${counter}`,
        };
        data.push(newObj);
        counter++;
      }
    });
    const combinedData = this.combineData(data, transformLocations);
    const output = {
      data: {
        navis: combinedData,
      },
      message: 'OK',
      code: 200,
    };
    this.logger.debug('end get data from legacy DB');

    return output;
  }

  /**
   * This method fetches locations for a list of product IDs in a specified store. /
   * このメソッドは、指定された店舗内の製品IDリストの位置情報を取得します。
   *
   * @param productIdArray - An array of product IDs to filter the data by. / データをフィルタリングするための製品 ID の配列。
   * @param storeCode - The code of the store to retrieve data for. / データを取得するショップのID。
   * @returns A Promise that resolves to an array of floor locations. / フロアの位置の配列に解決される Promise。
   */
  public async fetchLocations(productIdArray: string[], storeCode: string) {
    this.logger.debug('start fetchLocations');
    // Prepare the HTTP request headers with the client ID and client secret obtained from environment variables.
    // 環境変数から取得したクライアントIDとクライアントシークレットを使用して、HTTPリクエストヘッダーを準備します。
    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };
    // Create parameters for the request, including a comma-separated list of product IDs.
    // 製品IDのカンマ区切りのリストを含む、リクエストのためのパラメータを作成します。
    const params = {
      products: productIdArray.join(','),
    };
    // Get the base URL for the Mule API from environment variables and construct the full URL.
    // 環境変数からMule APIのベースURLを取得し、完全なURLを構築します。
    const url = this.env.get<string>('MULE_FLOOR_MAP_API');
    const fullurl = `${url}/${storeCode}/locations`;

    // Make an HTTP GET request to the Mule API using the constructed URL, headers, and parameters.
    // 構築されたURL、ヘッダー、およびパラメータを使用して、Mule APIに対してHTTP GETリクエストを行います.
    const { data } = await firstValueFrom(
      this.httpService.get(fullurl, { headers, params }).pipe(
        catchError((error: AxiosError) => {
          // If an error occurs during the API request, catch the error, log it, and throw an internal server error.
          // APIリクエスト中にエラーが発生した場合、エラーをキャッチし、ログに記録し、内部サーバーエラーをスローします.
          this.commonService.logException('Mule API occurred Error', error);
          const { errCode, errMessage, status } =
            this.floorMapUtilService.handleException(error);
          this.commonService.createHttpException(errCode, errMessage, status);
        }),
      ),
    );

    // Return the fetched products or location data.
    // 取得した製品または位置情報データを返します.
    const products = data;
    this.logger.debug('end fetchPrices');
    return products;
  }

  /**
   *  This function combines data from two different sources: gondolas and transformed product locations. /
   * この機能は、ゴンドラと変換された製品の場所という 2 つの異なるソースからのデータを結合します。
   *
   * @param gondolas - An array of gondola data, which includes title and other information./ タイトルやその他の情報を含むゴンドラ データの配列。
   * @param products - An array of transformed product locations. / 変換された製品の場所の配列。
   * @returns Return an array of 'CombinedData' objects. / 「CombinedData」オブジェクトの配列を返します。
   */
  private combineData(
    gondolas: Gondola[],
    products: TransformedProduct[],
  ): CombinedData[] {
    this.logger.debug('start combine data from legacy DB and Mule API');
    const combinedData: { [key: string]: CombinedData } = {};

    // Combine gondolas with the same title / 同じタイトルのゴンドラを結合する
    gondolas.forEach((gondola) => {
      if (!combinedData[gondola.url]) {
        // If there's no entry for the gondola's title, create one with initial data. /
        // ゴンドラのタイトルの入力がない場合は、初期データで作成してください。
        combinedData[gondola.url] = {
          title: gondola.title,
          mapUrl: gondola.url.includes('undefined')
            ? gondola.url
            : this.floorMapUtilService.getFullUrl(gondola.url),
          productIds: [
            {
              productId: gondola.prd_cd,
              gondolaCount: 0,
              gondolas: [],
            },
          ],
        };
      }
      const productData = combinedData[gondola.url];
      // Find a matching location for the current gondola by comparing product codes.
      // 製品コードを比較して、現在のゴンドラに一致する位置を見つけます。
      const matchingLocation = products.find(
        (location) => location.productCode === gondola.prd_cd,
      );

      // Check if gondola data is null. If true, initialize a new product entry with the product code and no associated gondolas.
      // ゴンドラデータがnullかどうかを確認します。trueの場合、製品コードと関連するゴンドラがない新しい製品エントリを初期化します。
      if (gondola.data == null) {
        const productId = matchingLocation ? matchingLocation.productCode : '';
        if (productId.length > 0) {
          // Check if productId is already present / productId がすでに存在するかどうかを確認する
          const isProductIdPresent = productData.productIds.some(
            (product) => product.productId === productId,
          );
          if (!isProductIdPresent) {
            productData.productIds.push({
              productId,
              gondolaCount: 0,
              gondolas: [],
            });
          }
        }
      } else {
        const gondolaId = JSON.parse(gondola.data).id.replace(/-/g, '');
        const matchingSections: {
          aisle: string;
          tier: number;
          row: number;
        }[] = [];

        if (matchingLocation) {
          matchingLocation.locations.forEach((location) => {
            // Compare digits of product ID and location ID / 製品IDと位置IDの桁を比較
            const isSubString = this.floorMapUtilService.compareProductIds(
              gondolaId,
              location.gondola,
            );
            if (isSubString) {
              matchingSections.push({
                aisle: location.aisle,
                tier: location.tier,
                row: location.row,
              });
            }
          });

          const productId = matchingLocation.productCode;

          const gondolaData = {
            fill: JSON.parse(gondola.data).fill,
            'fill-opacity': JSON.parse(gondola.data)['fill-opacity'],
            height: JSON.parse(gondola.data).height,
            id: JSON.parse(gondola.data).id,
            width: JSON.parse(gondola.data).width,
            x: JSON.parse(gondola.data).x,
            y: JSON.parse(gondola.data).y,
            sections: matchingSections,
          };
          const existingProduct = productData.productIds.find(
            (mergedProduct) => mergedProduct.productId === productId,
          );
          // Add the combined data to the 'productIds' array in the 'productData' object.
          // 結合されたデータを「productData」オブジェクトの「productIds」配列に追加します。
          if (existingProduct) {
            const isObjectAlreadyExists = existingProduct.gondolas.some(
              (existingObject) => existingObject.id === gondolaData.id, // Change this condition based on your comparison logic
            );
            if (!isObjectAlreadyExists) {
              existingProduct.gondolas.push(gondolaData);
              existingProduct.gondolaCount = existingProduct.gondolas.length;
            }
          } else {
            productData.productIds.push({
              productId,
              gondolaCount: 1,
              gondolas: [gondolaData],
            });
          }
        }
      }
    });

    this.logger.debug('end combine data from legacy DB and Mule API');
    // Return an array of 'CombinedData' objects. / 「CombinedData」オブジェクトの配列を返します。
    return Object.values(combinedData);
  }

  /**
   * Transforms the original array of products with locations into a new format.
   * 原始の商品とロケーションの配列を新しい形式に変換します。
   *
   * @param originalArray - The original array of products with locations. / ロケーション付き商品の元の配列。
   * @returns Transformed array of products with simplified location data. / シンプルなロケーションデータを持つ商品の変換された配列。
   */
  private transformLocation(originalArray: any): TransformedProduct[] {
    this.logger.debug('start tranform orginal array');
    // Create an array to store the transformed products. /
    // 変換された商品を格納するための配列を作成します。
    const transformedArray: TransformedProduct[] = originalArray.map(
      (originalProduct) => {
        // Map each location within the original product to a simplified format. /
        // 元の商品内の各ロケーションをシンプルな形式にマップします。
        const transformedLocations: TransformedLocation[] =
          originalProduct.locations.map((location) =>
            // Transform location data by selecting specific properties. /
            // 特定のプロパティを選択してロケーションデータを変換します。
            ({
              aisle: location.aisle,
              tier: location.tier,
              row: location.row,
              gondola: location.gondola,
            }),
          );
        this.logger.debug('end tranform orginal array');
        // Create a new product with the transformed location data. /
        // 変換されたロケーションデータを持つ新しい商品を作成します。
        return {
          storeCode: originalProduct.storeCode,
          productCode: originalProduct.productCode,
          locations: transformedLocations,
        };
      },
    );
    return transformedArray;
  }
}
