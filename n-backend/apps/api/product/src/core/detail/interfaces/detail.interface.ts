import {
  OmitTimestampProduct,
  OmitTimestampProductDetail,
  SpecCategory,
} from '@cainz-next-gen/types';
import { ErrorCode } from '../../../types/constants/error-code';

export interface ProductDetailResponse {
  code: number;
  message: string;
  errorCode?: ErrorCode;
  requestId?: string;
  timestamp?: string;
  data: ProductDetailsForResponse[];
}

type Weaken<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? unknown : T[P];
};

export interface InterProductDetails
  extends Weaken<
    OmitTimestampProductDetail,
    | 'applicableStartDate'
    | 'salesStartDate'
    | 'salesEndDate'
    | 'onlineStartTimeEc'
    | 'onlineEndTimeEc'
    | 'newPeriodFrom'
  > {
  applicableStartDate: string | null;
  salesStartDate: string | null;
  salesEndDate: string | null;
  onlineStartTimeEc: string | null;
  onlineEndTimeEc: string | null;
  newPeriodFrom: string | null;
}

export type ProductDetailsForResponse = InterProductDetails & {
  specCategories: SpecCategory[];
};

export interface ProductDetails {
  header: OmitTimestampProduct;
  detail: InterProductDetails;
  specCategories: SpecCategory[];
}
