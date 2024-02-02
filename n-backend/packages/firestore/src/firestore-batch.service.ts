import { LoggingService } from '@cainz-next-gen/logging';
import {
  CollectionReference,
  DocumentData,
  Firestore,
} from '@google-cloud/firestore';
import { Inject, Injectable, Scope } from '@nestjs/common';

/**
 * firestoreのbatch機能を利用するためのユーティリティクラス
 * */
@Injectable({ scope: Scope.TRANSIENT })
export class FirestoreBatchService {
  // firestoreのbatch機能は一度に登録・更新・削除合わせて500件までしか処理できないため
  private readonly BATCH_LIMIT = 500;

  private batch: FirebaseFirestore.WriteBatch;

  private writeCnt = 0;

  private deleteCnt = 0;

  private totalCnt = 0;

  constructor(
    @Inject('Firestore') private readonly db: Firestore,
    private readonly logger: LoggingService,
  ) {
    this.batch = this.db.batch();
  }

  /**
   * collectionを取得
   */
  findCollection(collectionName: string): CollectionReference<DocumentData> {
    return this.db.collection(collectionName);
  }

  /**
   * firestoreへデータを登録・更新する
   * batchの最大処理件数を超える場合にコミットする部分以外はfirestoreのsetと同じ
   * @param documentRef firestoreのドキュメント参照情報
   * @param data 書き込み対象のデータ
   * @param options firestoreのsetに渡すオプション
   */
  async batchSet(
    documentRef: FirebaseFirestore.DocumentReference,
    data: FirebaseFirestore.DocumentData,
    options: FirebaseFirestore.SetOptions,
  ): Promise<void> {
    if (this.getTotalOperationCnt() === this.BATCH_LIMIT) {
      await this.batchCommit();
    }
    this.batch.set(documentRef, data, options);
    this.writeCnt++;
  }

  /**
   * firestoreのデータを削除する
   * batchの最大処理件数を超える場合にコミットする部分以外はfirestoreのdeleteと同じ
   * @param documentRef firestoreのドキュメント参照情報
   * @param precondition firestoreのdeleteに渡すオプション
   */
  async batchDelete(
    documentRef: FirebaseFirestore.DocumentReference,
    precondition?: FirebaseFirestore.Precondition,
  ): Promise<void> {
    if (this.getTotalOperationCnt() === this.BATCH_LIMIT) {
      await this.batchCommit();
    }
    this.batch.delete(documentRef, precondition);
    this.deleteCnt++;
  }

  /**
   * set、deleteで実行した書き込み・削除処理をfirestoreへ反映させる
   */
  async batchCommit(): Promise<void> {
    await this.batch.commit();
    this.logger.debug(`Document successfully written! ${this.writeCnt} docs.`);
    this.logger.debug(`Document successfully deleted! ${this.deleteCnt} docs.`);
    this.totalCnt = this.totalCnt + this.writeCnt + this.deleteCnt;
    this.logger.debug(`Total executed count: ${this.totalCnt} docs.`);
    this.writeCnt = 0;
    this.deleteCnt = 0;
    this.batch = this.db.batch();
  }

  private getTotalOperationCnt(): number {
    return this.writeCnt + this.deleteCnt;
  }
}
