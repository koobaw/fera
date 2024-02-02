import { OmitTimestampProductPrice } from '@cainz-next-gen/types';
import { InventoryResponse } from '../../inventories/interfaces/inventory.interface';
import { ProductDetailsForResponse } from '../../detail/interfaces/detail.interface';

type RequiredProductDetail = {
  productId: string;
  name: string;
  imageUrls: string[];
} & Partial<
  Omit<ProductDetailsForResponse, 'productId' | 'name' | 'imageUrls'>
>;

export interface UnionProductInterface extends RequiredProductDetail {
  inventories?: InventoryResponse[];
  prices?: OmitTimestampProductPrice[];
}
