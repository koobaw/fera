import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

import { DetailDto } from '../dto/detail.dto';
import { DetailApiResponse } from '../interfaces/detail.interface';
import { MuleStoreResponse } from '../interfaces/mule-api-detail.interface';

@Injectable()
export class DetailMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  // TODO: muleAPIが完成次第要修正
  async getDetailFromMule(detailDto: DetailDto): Promise<MuleStoreResponse[]> {
    this.logger.debug('start get detail from mule');

    // const headers = {
    //   client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
    //   client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    // };
    // const { storeCodes } = detailDto;
    // const params = {
    //   codes: storeCodes.join(','),
    // };
    // const url = this.env.get<string>('MULE_DETAIL_API');
    //
    // const { data } = await firstValueFrom(
    //   this.httpService.get(url, { headers, params }).pipe(
    //     catchError((error: AxiosError) => {
    //       this.commonService.logException(`Mule API occurred Error`, error);
    //       throw new HttpException(
    //         {
    //           errorCode: ErrorCode.DETAIL_NG_MULE_DETAIL_API,
    //           message: ErrorMessage[ErrorCode.DETAIL_NG_MULE_DETAIL_API],
    //         },
    //         HttpStatus.INTERNAL_SERVER_ERROR,
    //       );
    //     }),
    //   ),
    // );

    const { data } = this.tempData();

    // this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);
    this.logger.debug('end get detail from mule');

    return data;
  }

  private tempData() {
    return {
      data: [
        {
          code: '666',
          name: 'カインズテスト店',
          address: '〒351-0005 埼玉県朝霞市根岸台3丁目20番1号',
          postCode: '351-0005',
          telNumberList: [
            {
              contactName: '本館',
              telNumber: '048-468-0111',
            },
          ],
          businessTime: '9:00〜20:00',
          businessTimeNote: '本館以外は19:00閉店',
          regularHoliday: '1月1日',
          regularHolidayNote: 'その他不定休あり',
          detail: {
            mainBuildingOpeningTime: '2020-09-23T00:00:00Z',
            mainBuildingClosingTime: '2020-09-23T11:00:00Z',
            ResourceBuildingOpeningTime: '2020-09-23T00:00:00Z',
            ResourceBuildingClosingTime: '2020-09-23T11:00:00Z',
            storeMapUrl: [
              'https://www.google.com/maps/place/%E3%82%AB%E3%82%A4%E3%83%B3%E3%82%BA%E6%B5%A6%E5%92%8C%E7%BE%8E%E5%9C%92%E5%BA%97/@35.9062869,139.7095379,17z/data=!3m1!4b1!4m6!3m5!1s0x6018bfbe6c481243:0x32418665a3ed40bd!8m2!3d35.9062869!4d139.7121128!16s%2Fg%2F11f51z0chz',
            ],
            visible: true,
            publiclyAccessible: true,
            publiclyAccessibleFrom: '2000-09-23T00:00:00Z',
            publiclyAccessibleTo: '2099-09-23T00:00:00Z',
            code: '666',
            landscape: {
              latitude: 35.808684,
              longitude: 139.610384,
            },
            floorGuideList: [
              {
                floorGuideOrder: 1,
                floorGuideName: '本館',
                floorGuideUrl:
                  'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F859_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
              },
            ],
            prefectureName: '埼玉県',
            prefectureCode: '11',
            openingDate: '2020-09-23T00:00:00Z',
            closingDate: '9999-12-31T00:00:00Z',
            supportPickup: true,
            supportCredit: true,
            supportPickupInnerLocker: true,
            supportPickupPlace: true,
            supportPickupPlaceParking: true,
            supportBackOrder: true,
            supportGeomagnetism: true,
            geomagnetismMapId: 'b8e3ef31b120404b848aa9fe1f66fc5a',
            supportPocketRegi: true,
            supportCuttingService: false,
            supportDIYReserve: true,
            supportDogRun: true,
            supportToolRental: true,
            showVisitingNumber: true,
            messageSettings: [
              {
                from: '2021-12-29T20:00:00Z',
                to: '2022-01-03T20:00:00Z',
                message:
                  '年末年始の営業時間は下記の店舗詳細WEBページからご確認ください。',
              },
              {
                from: '2021-08-10T20:00:00Z',
                to: '2022-08-12T20:00:00Z',
                message:
                  'お盆の営業時間は下記の店舗詳細WEBページからご確認ください。',
              },
            ],
            digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235839/',
            materialHallExistence: true,
            cultureClassExistence: false,
            cycleParkExistence: true,
            DIYSTYLEFloorExistence: true,
            dogParkExistence: true,
            exteriorPlazaExistence: true,
            foodAreaExistence: false,
            gardeningHallExistence: false,
            greenAdvisorExistence: false,
            petsOneExistence: true,
            reformCenterExistence: true,
            workshopExistence: false,
            storePickupExistence: true,
            supermarketExistence: true,
          },
          announcements: [
            {
              code: '666',
              title: '写真プリントキャンペーン',
              body: "開催日：2023年5月15日～2023年6月19日\rイベント内容：\r昔撮った思い出のビデオテープ …時が経つにつれテープの劣化やハード機器の故障等で観たいときに観れなくなるかもしれません。この機会に大切な動画をDVDに、音楽等をCDにダビングしてみませんか？\r2023年5月15日より2023年6月19日までの期間中、テープ5本以上のご注文で1本980円（税込）でお受け致します。（通常：10本以上のご注文で1本980円）各店サービスカウンターにて承りますので是非ご利用願います。\r問い合わせ先：サービスカウンター受付\r\r<b>くみまちモールあさか</b>\rカインズとイトーヨーカドーと30の専門店がスマートなくらしを応援します。\r<a href='https://cainz-kumimachi-asaka.com/' target='_blank'>詳細はこちら</a>",
            },
          ],
        },
      ],
    };
  }
}
