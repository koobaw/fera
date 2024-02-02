import { LocationDto } from '../dto/location.dto';
import {
  SearchStrategy,
  StoreIncludingDetail,
} from '../interfaces/search.interface';

export class LocationSort implements SearchStrategy {
  constructor(private readonly baseLocation: LocationDto) {}

  search(
    storeIncludingDetails: StoreIncludingDetail[],
  ): StoreIncludingDetail[] {
    if (
      this.baseLocation?.latitude == null ||
      this.baseLocation?.longitude == null
    ) {
      return storeIncludingDetails;
    }

    const sortByDistance = storeIncludingDetails.sort((a, b) => {
      const alfaLocation = a.detail.landscape;
      const bravoLocation = b.detail.landscape;

      const alfaDistance = Math.sqrt(
        (alfaLocation.latitude - this.baseLocation.latitude) ** 2 +
          (alfaLocation.longitude - this.baseLocation.longitude) ** 2,
      );
      const bravoDistance = Math.sqrt(
        (bravoLocation.latitude - this.baseLocation.latitude) ** 2 +
          (bravoLocation.longitude - this.baseLocation.longitude) ** 2,
      );
      return alfaDistance - bravoDistance;
    });

    return sortByDistance;
  }
}
