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
  SqlData,
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

    let data = [];
    data = await this.getMapUrl(productIdArray, storeCode);

    let transformLocations = [];
    if (productIdArray.length !== 0) {
      const locations = await this.fetchLocations(productIdArray, storeCode);
      transformLocations = this.transformLocation(locations);
    }

    data = await this.addMissingProducts(data, productIdArray, storeCode);

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
    const baseUrl = `${this.env.get<string>('MULE_API_BASE_URL')}`;
    const endPoint = `${this.env.get<string>('MULE_API_FLOOR_MAP_ENDPOINT')}`;
    const url = `${baseUrl}${endPoint}`;
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
              productId: gondola.prd_cd ? gondola.prd_cd : '',
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
        const productId = matchingLocation
          ? matchingLocation.productCode
          : gondola.prd_cd;
        if (productId && productId.length > 0) {
          // Check if productId is already present / productId がすでに存在するかどうかを確認する
          const isProductIdPresent = productData.productIds.some(
            (product) => product.productId === productId,
          );
          if (!isProductIdPresent) {
            productData.productIds.push({
              productId,
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
            id: JSON.parse(gondola.data).id,
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
            }
          } else {
            productData.productIds.push({
              productId,
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
   * Retrieves floor map data from the legacy database based on the provided parameters.
   * プロバイダされたパラメータに基づいて、レガシーデータベースからフロアマップデータを取得します。
   *
   * @param {string[]} productIdArray - An array of product IDs for filtering the floor map data. / フロアマップデータをフィルタリングするための製品 ID の配列
   * @param {string} storeCode - The store code to identify the specific store for fetching floor map data. / フロアマップデータを取得するための特定の店舗を識別するための店舗コード。
   * @returns {Promise<SqlData[]>} - A promise that resolves to an array of floor map data. / フロア マップ データの配列に解決される Promise。
   */
  private async getMapUrl(
    productIdArray: string[],
    storeCode: string,
  ): Promise<SqlData[]> {
    this.logger.debug('start sql connection activity');
    const dbConfig = this.floorMapUtilService.getLegacyDbConfig();

    let data = [];
    let connection;
    try {
      // Create a database connection using the provided configuration / 提供された設定を使用してデータベース接続を作成
      connection = await mysql.createConnection(dbConfig);
      // Get the SQL query for retrieving floor map data / フロアマップデータを取得するためのSQLクエリを取得
      const sql =
        productIdArray.length === 0
          ? this.floorMapUtilService.getQueryWithoutProducts('')
          : this.floorMapUtilService.getQuery('');

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
      await this.logExplain(productIdArray, storeCode, connection, 'EXPLAIN');
      this.logger.debug('end sql connection activity');
      return data;
    } catch (e) {
      this.commonService.logException(
        `import  error. failed to connect legacy DB`,
        e,
      );
      // Create an HTTP exception with appropriate error codes and status / 適切なエラーコードとステータスを持つHTTP例外を生成
      throw new Error(ErrorMessage[ErrorCode.FlOOR_MAP_CONNECT_LEGACY_DB]);
    } finally {
      // Close the database connection, whether an exception occurred or not / 例外が発生しているかどうかに関係なくデータベース接続を閉じる
      connection.end();
    }
  }

  /**
   * Adds missing products to the given data array based on the specified productIdArray and storeCode.
   * 指定された productIdArray と storeCode に基づいて、欠落している製品を指定されたデータ配列に追加します。
   *
   * @param data - The existing array of product data. / 製品データの既存の配列。
   * @param productIdArray - An array of product IDs. / 製品 ID の配列。
   * @param storeCode - The store code associated with the product data. / 商品データに関連付けられた店舗コード。
   * @returns A Promise resolving to an array of product data, including the added missing products. / 追加された不足している製品を含む、一連の製品データを解決する Promise。
   */
  private async addMissingProducts(
    data: SqlData[],
    productIdArray: string[],
    storeCode: string,
  ): Promise<SqlData[]> {
    let completeData: SqlData[] = [];
    completeData = data;
    // Create a set of existing prd_cd values / 既存の prd_cd 値のセットを作成する
    const existingPrdCodes = new Set(data.map((item) => item.prd_cd));
    let counter = 1;
    // Check and add missing values / 欠損値を確認して追加する
    const mapData = productIdArray.map(async (productId) => {
      if (!existingPrdCodes.has(productId)) {
        let productObject = [];
        // If it's the first iteration, fetch product data from the legacy database
        // 最初のイテレーションの場合は、レガシーデータベースから製品データを取得
        if (counter === 1) {
          productObject = await this.getMapUrl([], storeCode);
        }
        // Create a new object with prd_cd, title, url, and null data
        // prd_cd、title、url、および null データを持つ新しいオブジェクトを作成
        const mapArray = productObject.map((product) => ({
          prd_cd: productId,
          title: product.title,
          url: product.url,
          data: null,
        }));
        counter++;
        return mapArray;
      }
      return undefined;
    });

    // Wait for all promises in the array 'mapData' to resolve and store the results in 'newData'
    // 配列 'mapData' のすべてのプロミスが解決するのを待ち、その結果を 'newData' に格納
    let newData = await Promise.all(mapData);

    // Filter out any undefined elements from 'newData'
    // 'newData' から undefined の要素をフィルタリング
    newData = newData.filter((element) => element !== undefined);
    // Concatenate the existing 'data' array with the filtered 'newData' array
    // 既存の 'data' 配列とフィルターされた 'newData' 配列を連結
    if (newData && newData[0] && newData[0].length > 0) {
      completeData = completeData.concat(...newData).flat();
    }
    // Sort data array based on the order of values in productIdArray
    // productIdArray の値の順序に基づいてデータ配列を並べ替えます
    completeData.sort((a, b) => {
      const indexA = productIdArray.indexOf(a.prd_cd);
      const indexB = productIdArray.indexOf(b.prd_cd);
      return indexA - indexB;
    });

    return completeData;
  }

  /**
   * Logs floor map data sql query details from the legacy database based on the provided parameters.
   * 指定されたパラメータに基づいて、レガシー データベースからのフロア マップ データ SQL クエリの詳細をログに記録します。
   *
   * @param {string[]} productIdArray - An array of product IDs for filtering the floor map data. / フロアマップデータをフィルタリングするための製品 ID の配列
   * @param {string} storeCode - The store code to identify the specific store for fetching floor map data. / フロアマップデータを取得するための特定の店舗を識別するための店舗コード。
   * @param {string[]} connection - SQL connection to establish the connection between host and database for fetching the floor map data. / フロアマップデータを取得するためにホストとデータベース間の接続を確立するための SQL 接続。
   * @param {string} query - Query element that used to concatenate with existing query structure / 既存のクエリ構造と連結するために使用されていたクエリ要素
   */
  private async logExplain(
    productIdArray: string[],
    storeCode: string,
    connection: mysql.Connection,
    query: string,
  ) {
    const sql =
      productIdArray.length === 0
        ? this.floorMapUtilService.getQueryWithoutProducts(query)
        : this.floorMapUtilService.getQuery(query);

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
    const log = Object.values(JSON.parse(JSON.stringify(rows)));

    console.log(
      'sql logs >>>',
      log,
    ); /* DONT REMOVE THIS LOG / このログは削除しないでください */
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
