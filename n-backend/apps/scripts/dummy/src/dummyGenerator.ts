import * as admin from 'firebase-admin';
import * as clui from 'clui';

import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore';

/* eslint no-console: ["error", { allow: ["error","warn","log"] }] */
export const seedList = [];

interface FirestoreStructure {
  collectionName: string;
  documents: FirestoreDocument[];
}

interface FirestoreDocument {
  documentName?: string;
  data?: object;
  subCollection?: FirestoreStructure;
}

admin.initializeApp({
  projectId: 'fera-feraapp-backend-dev',
  credential: admin.credential.applicationDefault(),
});

// print current project id
const content = `Current Project: ${admin.app().options.projectId}`;
const border = `+${'-'.repeat(content.length + 2)}+`;
console.log(border);
console.log(`| ${content} |`);
console.log(border);

const db = admin.firestore();

const { Progress } = clui;
const generateProgressBar = new Progress(20);
let isFirstTask = true;
let taskSize = 0;
let completedTaskSize = 0;

const deleteCollection = async (collectionRef: CollectionReference) => {
  const docs = await collectionRef.listDocuments();
  const batch = db.batch();
  docs.forEach((doc) => {
    batch.delete(doc);
  });
  await batch.commit();
};

const executeBatch = (batch: admin.firestore.WriteBatch) => {
  batch.commit().catch((error) => {
    console.error('Error in batched write: ', error);
  });
};

const addDocs = async (
  firestoreStructure: FirestoreStructure,
  entryPoint: Firestore | DocumentReference,
) => {
  const collectionRef = entryPoint.collection(
    firestoreStructure.collectionName,
  );
  await deleteCollection(collectionRef);

  firestoreStructure.documents.forEach((document) => {
    const docRef: DocumentReference<admin.firestore.DocumentData> =
      document.documentName
        ? collectionRef.doc(document.documentName)
        : collectionRef.doc();

    const batch = db.batch();
    if (document.data) {
      batch.set(docRef, document.data as DocumentData);
      executeBatch(batch);

      completedTaskSize++;
      console.log(generateProgressBar.update(completedTaskSize, taskSize));
    }

    if (document.subCollection) {
      addDocs(document.subCollection, docRef);
    }
  });
};

const getAllFlatDocument = (
  firestoreStructure: FirestoreStructure,
): FirestoreDocument[] =>
  firestoreStructure.documents.flatMap((document) => {
    if (!document.subCollection) {
      return document;
    }

    if (document.data) {
      return [document, ...getAllFlatDocument(document.subCollection)];
    }
    return getAllFlatDocument(document.subCollection);
  });

export const addCollectionData = async (
  firestoreStructure: FirestoreStructure,
) => {
  taskSize += getAllFlatDocument(firestoreStructure).length;
  if (isFirstTask) {
    console.log(generateProgressBar.update(0, taskSize));
    isFirstTask = false;
  }

  await addDocs(firestoreStructure, db);
};
