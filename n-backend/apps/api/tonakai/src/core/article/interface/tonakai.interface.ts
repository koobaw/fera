export interface RawArticlesResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score?: number | string;
    hits: RawArticle[];
  };
}

export interface RawArticle {
  _index: string;
  _type: string;
  _id: string;
  _score?: number | string;
  _source: {
    client_post?: string;
    image: {
      url: string;
    };
    release_date: string;
    id: string;
    title: string;
    sort_date: number;
  };
  sort: number[];
}
