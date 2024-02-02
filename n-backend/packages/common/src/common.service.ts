import * as crypto from 'crypto';
import { IncomingHttpHeaders } from 'http';
import { getAuth } from 'firebase-admin/auth';
import { LoggingService } from '@cainz-next-gen/logging';
import { Claims, Timestamp } from '@cainz-next-gen/types';
import {
  HttpException,
  HttpStatus,
  Injectable,
  RequestMethod,
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CloudTasksClient, protos } from '@google-cloud/tasks';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { isAxiosError } from 'axios';
import firestore from '@google-cloud/firestore';

@Injectable()
export class CommonService {
  constructor(private readonly logger: LoggingService) {
    dayjs.extend(timezone);
    dayjs.extend(utc);
  }

  /**
   * @param {string} path
   * @example
   *
   * ```js
   * /your/path
   * ```
   *
   * @param {string} method - HTTP Request Method(get, post, put, delete等)
   * @return {string} Firestore systemName that use firestore createdAt, updatedAt
   *
   * @throws {Error} Will throw an error if method is not http methods
   */
  public createFirestoreSystemName(path: string, method: string): string {
    const isNotRequestMethod = !Object.keys(RequestMethod)
      .filter((key) => Number.isNaN(Number(key)))
      .includes(method.toUpperCase());

    if (isNotRequestMethod) {
      throw new Error('This method name is not http method');
    }
    return `${[path]}:${method}`.toLowerCase();
  }

  /**
   *
   * @param {string} token - user token
   * @returns {Claims} - firebaseAuth user claims
   *
   * @throws {Error} Will throw an error if token is invalid
   */
  public getClaims(token: string): Claims {
    this.logger.debug(`token: ${token}`);
    let userInfo;
    try {
      userInfo = JSON.parse(
        Buffer.from(token.split('.')[0], 'base64url').toString('utf-8'),
      );
    } catch (e) {
      throw new Error('Failed to parse user token.');
    }

    this.logger.debug(`userInfo: ${JSON.stringify(userInfo)}`);

    if (!userInfo?.user_id) {
      throw new Error('Invalid user token.');
    }

    const claims: Claims = {
      userId: userInfo.user_id,
      encryptedMemberId: userInfo.encryptedMemberId,
      accessToken: userInfo.accessToken,
      refreshToken: userInfo.refreshToken,
    };

    this.logger.debug(`currentUserId: ${JSON.stringify(claims)}`);
    return claims;
  }

  /**
   *
   * @returns {string} requestId
   *
   * @throws {Error} when failed to generate requestId
   */
  public generateRequestId(): string {
    try {
      return v4();
    } catch (e) {
      throw new Error('Failed to generate requestId.');
    }
  }

  /**
   *
   * @param {IncomingHttpHeaders} headers
   * @param {any} body
   * @returns {string} correlationId
   *
   * @throws {Error} when failed to generate correlationId
   */
  public generateCorrelationId(
    headers: IncomingHttpHeaders,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
  ): string {
    let correlationId: string;
    if (headers && headers['x-correlation-id']) {
      if (typeof headers['x-correlation-id'] === 'string') {
        correlationId = headers['x-correlation-id'];
      } else {
        throw new Error('CorrelationId in headers is not string.');
      }
    } else if (body && body.correlationId) {
      correlationId = body.correlationId;
    } else {
      try {
        correlationId = v4();
      } catch (e) {
        throw new Error('Failed to generate correlationId.');
      }
    }
    return correlationId;
  }

  /**
   *
   * @returns {string} current datetime string in JST
   */
  public getDateTimeStringJST(): string {
    return dayjs().tz('Asia/Tokyo').format();
  }

  /**
   * 日本時間で0時として登録
   * 本メソッドで変換後にUTCにすると、9時間マイナスとなる
   * @param {string} date (yyyy-mm-dd)
   * @returns {string} JSTの形にフォーマット
   *
   * @throws {Error} If the date format is not in the expected format (YYYY-MM-DD)
   */
  public convertDateToJST(date: string): string {
    const regex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(date)) {
      throw new Error('This string is not the expected date type(YYYY-MM-DD)');
    }

    return `${date}T00:00:00+09:00`;
  }

  /**
   * 日付を表す文字列を、日本時間00:00:00かつISO-8601形式の文字列に変換する
   *
   * YYYYMMDD形式(時分秒を00:00:00として変換)
   * YYYY-MM-DD形式(時分秒を00:00:00として変換)
   * ISO8601形式(時分秒を00:00:00に変換。UTCの場合はJSTに変換。)
   *
   * @param {string | null} dateString (yyyymmdd / yyyy-mm-dd / yyyy-mm-ddTHH:MM:SS / ISO8601string)
   * @returns {string | null} JST型の00:00:00の文字列。変換不能な形式の場合はnullを返す
   */
  public convertDateStringToJstTimestampString(
    dateString: string | null,
  ): string | null {
    if (dateString == null) {
      return null;
    }
    // Extended iso-8601(1990-01-01T00:00:00+09:00) pattern
    const extendedIso8601Regex =
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T\d{2}:\d{2}:\d{2}\+09:00$/;
    if (extendedIso8601Regex.test(dateString)) {
      const expectedDate = `${dateString.split('T')[0]}T00:00:00+09:00`;
      return expectedDate;
    }

    // No offset(1990-01-01T00:00:00) pattern
    const noOffsetRegex =
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T\d{2}:\d{2}:\d{2}$/;
    if (noOffsetRegex.test(dateString)) {
      const expectedDate = `${dateString.split('T')[0]}T00:00:00+09:00`;
      return expectedDate;
    }
    // Exist hyphen(1990-01-01) pattern
    const existHyphenRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
    if (existHyphenRegex.test(dateString)) {
      const expectedDate = `${dateString}T00:00:00+09:00`;
      return expectedDate;
    }
    // No hyphen(19900101) pattern
    const noHyphenRegex = /^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/;
    if (noHyphenRegex.test(dateString)) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const expectedDate = `${year}-${month}-${day}T00:00:00+09:00`;
      return expectedDate;
    }
    // No matched
    return null;
  }

  /**
   *
   * タイムスタンプを表す文字列をfirestoreのtimestamp型のオブジェクトに変換する
   * nullが指定された場合はnullを返す
   * @param {string | null} timestampString
   * @returns {Timestamp | null} firestoreのtimestampまたはnull
   *
   * @throws {Error} if fail to convert firestore timestamp
   */
  public convertToTimestampWithNull(
    timestampString: string | null,
  ): Timestamp | null {
    if (timestampString == null) {
      return null;
    }
    try {
      return firestore.Timestamp.fromDate(new Date(timestampString));
    } catch (e: unknown) {
      this.logException(`invalid timestamp string`, e);
      throw new Error('This string cannot to convert timestamp');
    }
  }

  /**
   * memberId(cainzCardId)、access_tokenなどをfirebase authのclaimに保存
   */
  public async saveToFirebaseAuthClaims(
    userId: string,
    encryptedMemberId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    this.logger.info(`start saveToFirebaseAuthClaims`);
    await getAuth().setCustomUserClaims(userId, {
      accessToken,
      refreshToken,
      encryptedMemberId,
    });
    this.logger.info(`end saveToFirebaseAuthClaims`);
  }

  /**
   *
   * @param object
   * @returns {string} stringify object without circular references
   */
  public stringifyWithoutCircularRefs(object: object): string {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return undefined;
          }
          seen.add(value);
        }
        return value;
      };
    };
    return JSON.stringify(object, getCircularReplacer());
  }

  /**
   *
   * @param message
   * @param error
   */
  public logException(message: string, error: unknown) {
    this.logger.error(message);
    if (isAxiosError(error)) {
      // handle axios error
      if (error?.message) {
        this.logger.error('error.message', error.message);
      }
      if (error?.response) {
        if (error.response.status) {
          this.logger.error(
            'error.response.status',
            String(error.response.status),
          );
        }
        if (error.response.data === 'string') {
          this.logger.error('error.response.data', error.response.data);
        } else {
          this.logger.error(
            'error.response.data',
            JSON.stringify(error.response.data),
          );
        }
      }
    } else if (error instanceof Error) {
      // handle other Error
      if (error?.message) {
        this.logger.error('error.message', error.message);
      }
      if (error?.stack) {
        this.logger.error('error.stack', error.stack);
      }
    } else if (typeof error === 'string') {
      this.logger.error('Error', error);
    } else if (error === null) {
      this.logger.error('Error', 'null');
    } else if (typeof error === 'undefined') {
      this.logger.error('Error', 'undefined');
    } else if (typeof error === 'object') {
      this.logger.error('Error', this.stringifyWithoutCircularRefs(error));
    } else {
      this.logger.error('Error', 'unknown!!!!!!!');
    }
  }

  /**
   * To Throw HttpException / HttpException をスローする
   * @param errorCode Custom Error Code / カスタムエラーコード
   * @param errorMessage Custom Error message / カスタムエラーメッセージ
   * @param statusCode HttpStatus code / HttpStatusコード
   */
  public createHttpException(
    errCode: string,
    errorMessage: string,
    statusCode: HttpStatus,
  ): never {
    throw new HttpException(
      {
        errorCode: errCode,
        message: errorMessage,
      },
      statusCode,
    );
  }

  /**
   *  It will return encrypted text using provided UTF-8 key and iv / 提供された UTF-8 キーと iv を使用して暗号化されたテキストが返されます。
   * @param text text you want to encrypt / 暗号化したいテキスト
   * @param key encryption key / 暗号化キー(utf-8エンコードされた文字列)
   * @param iv encryption vector / 暗号化ベクトル(utf-8エンコードされた文字列)
   * @returns it return encrypted string. / 暗号化された文字列を返します。
   */
  public encryptAES256(text: string, key: string, iv: string): string {
    if (!text || !key || !iv) return '';
    const keyBytes = Buffer.from(key, 'utf-8');
    const ivBytes = Buffer.from(iv, 'utf-8');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBytes, ivBytes);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * It will return decrypted text using provided UTF-8 key and iv / 提供された UTF-8 キーと iv を使用して復号化されたテキストが返されます。
   * @param encrypted input encrypted text / 暗号化されたテキストを入力する
   * @param key UTF-8 key provided from project service / プロジェクト サービスから提供される UTF-8 キー
   * @param iv UTF-8 iv providing from project service / UTF-8 iv プロジェクトサービスから提供
   * @returns it return decrypted string. / 復号化された文字列を返します。
   */
  public decryptAES256(encrypted: string, key: string, iv: string): string {
    if (!encrypted || !key || !iv) return '';
    const keyBytes = Buffer.from(key, 'utf-8');
    const ivBytes = Buffer.from(iv, 'utf-8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, ivBytes);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Returns the MD5 hash of the given string / 与えられた文字列のMD5ハッシュを返します。
   * @param str input string to be hashed / ハッシュ化される入力文字列
   * @returns MD5 hashed string. / MD5ハッシュ化された文字列を返します。
   */
  public createMd5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * Create cloud-task
   * @param queue
   * @param url
   * @param bearerHeader
   * @param correlationId
   * @param httpMethod
   * @param payload
   * @param region default is 'asia-northeast1'
   */
  public async createTask(
    queue: string,
    url: string,
    bearerHeader: string | undefined,
    apikeyHeader: string | undefined,
    correlationId: string | undefined,
    httpMethod: protos.google.cloud.tasks.v2.HttpMethod,
    payload: object | undefined,
    region = 'asia-northeast1',
  ) {
    this.logger.debug('start createTask');

    const project = process.env.PROJECT_ID;

    const client = new CloudTasksClient();
    const parent = client.queuePath(project, region, queue);

    const headers: { [k: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (bearerHeader) {
      headers.Authorization = bearerHeader;
    }
    if (apikeyHeader) {
      headers['cainzapp-api-key'] = apikeyHeader;
    }
    if (correlationId) {
      headers['x-correlation-id'] = correlationId;
    }

    const httpRequest = {
      headers,
      httpMethod,
      url,
      body: undefined,
    };
    if (payload) {
      httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
        'base64',
      );
    }
    const task: protos.google.cloud.tasks.v2.ITask = { httpRequest };

    // Send create task request.
    const request = { parent, task };
    await client.createTask(request);

    this.logger.debug('end createTask');
  }
}
