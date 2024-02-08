export interface Gondola {
  prd_cd: string;
  name: string;
  title: string;
  url: string;
  data: string;
}

export interface TransformedLocation {
  aisle: string;
  tier: number;
  row: number;
  gondola?: string;
}

export interface TransformedProduct {
  storeCode: string;
  productCode: string;
  locations: TransformedLocation[];
}

export interface CombinedData {
  title: string;
  mapUrl: string;
  productIds: {
    productId: string;
    gondolas: {
      id: string;
      sections: TransformedLocation[];
    }[];
  }[];
}

export interface SqlData {
  prd_cd?: string;
  name?: string;
  title?: string;
  url?: string;
  data?: string; // Assuming 'data' is a JSON string; if you need a more detailed structure, you can create a separate interface for it
}

export interface MuleErrorResponse {
  status?: number;
  cid?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}
interface ErrorObject {
  code: string;
  message: string;
}
