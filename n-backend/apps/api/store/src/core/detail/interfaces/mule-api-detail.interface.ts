interface Landscape {
  latitude: number;
  longitude: number;
}

interface FloorGuide {
  floorGuideOrder: number;
  floorGuideName: string;
  floorGuideUrl: string;
}

interface MessageSetting {
  from: string;
  to: string;
  message: string;
}

interface DetailItem {
  mainBuildingOpeningTime: string | number | Date;
  mainBuildingClosingTime: string | number | Date;
  ResourceBuildingOpeningTime: string | number | Date;
  ResourceBuildingClosingTime: string | number | Date;
  storeMapUrl: string[];
  visible: boolean;
  publiclyAccessible: boolean;
  publiclyAccessibleFrom: string | number | Date;
  publiclyAccessibleTo: string | number | Date;
  code: string;
  landscape: Landscape;
  floorGuideList: FloorGuide[];
  prefectureName: string;
  prefectureCode: string;
  openingDate: string;
  closingDate: string;
  supportPickup: boolean;
  supportCredit: boolean;
  supportPickupInnerLocker: boolean;
  supportPickupPlace: boolean;
  supportPickupPlaceParking: boolean;
  supportBackOrder: boolean;
  supportGeomagnetism: boolean;
  geomagnetismMapId?: string;
  supportPocketRegi: boolean;
  supportCuttingService: boolean;
  supportDIYReserve: boolean;
  supportDogRun: boolean;
  supportToolRental: boolean;
  showVisitingNumber: boolean;
  messageSettings: MessageSetting[];
  digitalFlyerURL: string;
  materialHallExistence: boolean;
  cultureClassExistence: boolean;
  cycleParkExistence: boolean;
  DIYSTYLEFloorExistence: boolean;
  dogParkExistence: boolean;
  exteriorPlazaExistence: boolean;
  foodAreaExistence: boolean;
  gardeningHallExistence: boolean;
  greenAdvisorExistence: boolean;
  petsOneExistence: boolean;
  reformCenterExistence: boolean;
  workshopExistence: boolean;
  storePickupExistence: boolean;
  supermarketExistence: boolean;
}

interface TelNumberItem {
  contactName: string;
  telNumber: string;
}

interface Announcement {
  code: string;
  title: string;
  body: string;
}

export interface MuleStoreResponse {
  code: string;
  name: string;
  address: string;
  postCode: string;
  telNumberList: TelNumberItem[];
  businessTime: string;
  businessTimeNote?: string;
  regularHoliday: string;
  regularHolidayNote?: string;
  detail: DetailItem;
  announcements: Announcement[];
}
