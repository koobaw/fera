import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@cainz-next-gen/common';

/**
 * 環境ごとに秘密鍵とIVを生成したい場合は以下のコードを実行して取得
 * const key = crypto.randomBytes(32).toString('base64');
 * const iv = crypto.randomBytes(16).toString('base64');
 */

@Injectable()
export class CryptoUtilsService {
  constructor(
    private readonly env: ConfigService,
    private commonService: CommonService,
  ) {}

  // 暗号化
  public encryptAES256(text: string): string {
    const [key, iv] = this.getKeyAndIv();
    return this.commonService.encryptAES256(text, key, iv);
  }

  // 複合化
  public decryptAES256(encrypted: string): string {
    const [key, iv] = this.getKeyAndIv();
    return this.commonService.decryptAES256(encrypted, key, iv);
  }

  // 暗号化複合化用のkeyとivを取得
  private getKeyAndIv(): string[] {
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');

    if (!key) {
      throw new HttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!iv) {
      throw new HttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        HttpStatus.BAD_REQUEST,
      );
    }

    return [key, iv];
  }
}
