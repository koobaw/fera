import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { Injectable } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { USERS_COLLECTION_NAME } from '@cainz-next-gen/types';

@Injectable()
export class PocketRegiCheckinCommonService {
  private readonly USERS_COLLECTION_NAME = USERS_COLLECTION_NAME;

  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * valdate qr code data, only accepted format is : cainzapp://qr?shopcode={XXX} only 2 to 4 digit shopcode will allow / QR コード データを検証します。受け入れられる形式は次のとおりです: Coin app://qr?shopcode={XXX} 2 ～ 4 桁のショップコードのみが許可されます
   * @param qrCodeStr string value / 文字列値
   * @returns true/false boolean
   */
  public validateAllowedQrCodeData(qrCodeStr: string) {
    if (
      !qrCodeStr ||
      qrCodeStr.trim().length === 0 ||
      typeof qrCodeStr !== 'string'
    ) {
      return false;
    }
    const pattern = /^cainzapp:\/\/qr\?shopcode=\d{2,4}$/; // it will only allow 2 to 4 digit shopcode

    const isValidQrCode = pattern.test(qrCodeStr);
    return isValidQrCode;
  }

  /**
   * valdate date, only accepted format is : September 26, 2023 at 5:08:00 PM UTC+5:30 / 日付を検証します。受け入れられる形式は次のとおりです: September 26, 2023 at 5:08:00 PM UTC+5:30
   * @param dateStr string value / 文字列値
   * @returns true/false boolean
   */
  public validateAllowedCheckInDate(dateStr: string) {
    if (
      !dateStr ||
      dateStr.trim().length === 0 ||
      typeof dateStr !== 'string'
    ) {
      return false;
    }
    const pattern =
      /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\.\d{3}Z$/;

    const isValidDate = pattern.test(dateStr);
    return isValidDate;
  }

  /**
   * getting shopcode from qr cod string / QRコード文字列からストップコードを取得
   * @param qrCodeData string value / 文字列値
   * @returns shopcode string value / 文字列値
   */
  public getShopcodeFromQrData(qrCodeData: string) {
    const regex = /(\d+)/;
    const match = qrCodeData.match(regex);
    const shopcode = match[1].replace(/^0+/, ''); // replce function will trim 0 from starting of shopcode, like 0123 become 123
    return shopcode;
  }

  /**
   * get firestore document reference from collection / コレクションから Firestore ドキュメント参照を取得する
   * @param collectionName string value / 文字列値
   * @param docId string value / 文字列値
   * @returns docRef reference of firestore document / Firestoreドキュメントのリファレンス
   */
  public getFirestoreDocRef(collectionName: string, docId: string) {
    const collection =
      this.firestoreBatchService.findCollection(collectionName);
    const docRef = collection.doc(docId);
    return docRef;
  }

  /**
   * get firestore sub document reference from collection / コレクションから Firestore サブドキュメント参照を取得します
   * @param docRef
   * @param subCollectionName string value / 文字列値
   * @param subDocId string value / 文字列値
   * @returns subDocRef reference of firestore sub document / Firestore サブドキュメントのリファレンス
   */
  public getFirestoreSubDocRef(
    docRef: any,
    subCollectionName: string,
    subDocId: string,
  ) {
    const subDocRef = docRef.collection(subCollectionName).doc(subDocId);
    return subDocRef;
  }

  /**
   * get data firestore collection with doc id / ドキュメント ID を使用してデータ Firestore コレクションを取得します
   * @param collectionName string value / 文字列値
   * @param docId string value / 文字列値
   * @returns { doc, docRef } doc is the object of that document and docRef reference of firestore document / doc はそのドキュメントのオブジェクトであり、firestore ドキュメントの docRef 参照です。
   */
  public async getDocumentFromCollection(collectionName: string, docId: any) {
    const docRef = this.getFirestoreDocRef(collectionName, docId);
    const snapshot = await docRef.get();
    const doc = snapshot.data();
    return { doc, docRef };
  }

  /**
   * get data firestore sub collection with sub doc id / サブドキュメントIDを使用してデータFirestoreサブコレクションを取得します
   * @param docRef
   * @param subCollectionName string value / 文字列値
   * @param subDocId string value / 文字列値
   * @returns { subDoc, subDocRef } subDoc is the object of that document and subDocRef reference of firestore document / subDoc はそのドキュメントのオブジェクトであり、firestore ドキュメントの subDocRef 参照です。
   */
  public async getDocumentFromSubCollection(
    docRef: any,
    subCollectionName: string,
    subDocId: any,
  ) {
    const subDocRef = this.getFirestoreSubDocRef(
      docRef,
      subCollectionName,
      subDocId,
    );
    const subSnapshot = await subDocRef.get();
    const subDoc = subSnapshot.data();
    return { subDoc, subDocRef };
  }

  /**
   * validate user id is exists or not in 'users' collection / ユーザー ID が「users」コレクションに存在するかどうかを検証します
   * @param userId string value / 文字列値
   * @returns true/false boolean
   */
  public async checkUserFromCollection(encryptedMemberId: string) {
    try {
      const { doc } = await this.getDocumentFromCollection(
        this.USERS_COLLECTION_NAME,
        encryptedMemberId,
      );
      if (!doc) {
        return false;
      }
      return true;
    } catch (e: unknown) {
      this.commonService.logException(`user not found.`, e);
      return false;
    }
  }
}
