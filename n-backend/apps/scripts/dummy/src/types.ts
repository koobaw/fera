type CollectionNames =
  | 'recommendedProducts10'
  | 'campaigns'
  | 'featuredSale'
  | 'pickupArticles'
  | 'popularProducts'
  | 'recentHotSellers'
  | 'recommendedProducts10'
  | 'stores'
  | 'detail'
  | 'announcements'
  | 'surgeInViews'
  | 'tonakaiNewerPosts'
  | 'tonakaiRanking'
  | 'flyers'
  | 'categories';

export interface FirestoreStructure {
  collectionName: CollectionNames;
  documents: FirestoreDocument[];
}

export interface FirestoreDocument {
  documentName?: string;
  data?: object;
  subCollection?: FirestoreStructure;
}
