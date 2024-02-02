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
    gondolaCount: number;
    gondolas: {
      fill: string;
      'fill-opacity': string;
      height: string;
      id: string;
      width: string;
      x: string;
      y: string;
      sections: TransformedLocation[];
    }[];
  }[];
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
