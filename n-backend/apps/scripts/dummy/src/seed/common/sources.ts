import * as admin from 'firebase-admin';

export const campaignIds = [
  '0016543',
  '0016544',
  '0016545',
  '0016546',
  '0016547',
  '0016548',
  '0016549',
  '0016550',
  '0016551',
  '0016552',
  '0016553',
  '0016554',
  '0016555',
  '0016556',
  '0016557',
  '0016558',
  '0016559',
  '0016560',
];

export const planIds = [
  '1014',
  '1015',
  '1016',
  '1017',
  '1018',
  '1019',
  '1020',
  '1021',
  '1022',
  '1023',
  '1024',
  '1025',
  '1026',
  '1027',
  '1028',
  '1029',
  '1030',
];
export const thumbnails = [
  'https://img.cainz.com/ec/page/amido/amido_thumbnail_small.jpg?auto=compress,format&w=380',
  'https://img.cainz.com/ec/page/amido/amido_thumbnail_small.jpg?auto=compress,format&w=380',
  'https://img.cainz.com/ec/page/grass/grass_thumbnail_small_cp.jpg?auto=compress,format&w=380',
  'https://img.cainz.com/ec/page/steel_rack/steel_rack_thumbnail_small.jpg?auto=compress,format&w=380',
  'https://img.cainz.com/ec/page/chozouko/chozouko_thumbnail_small.jpg?auto=compress,format&w=380',
  'https://img.cainz.com/ec/page/season_style/season_style_thumbnail_small.jpg?auto=format,compress&w=380',
];

export const productIds = [
  '4992536441210',
  '4997789324471',
  '4549509206422',
  '4936695742542',
  '4549509686743',
  '4549509628453',
  '4549509719793',
  '4549509612704',
  '4983771272554',
  '4936695303484',
  '4549509621584',
  '4901133626005',
  '4549509646945',
  '4943125709655',
  '4549509749165',
  '4549509112365',
  '4550533004595',
  '4549509304166',
  '4549509908647',
  '4549509735809',
];

export const articleTitles = [
  '自宅に窓際カフェススペースを作って、いつでもおしゃれに撮影できるようにしてみた',
  '日本初の水生植物専門店「杜若園芸」に聞いたメダカの飼育におすすめの水草は？',
  '高級ベッドみたいな高反発力！ カインズのflatty（フラッティ）なら家中どこでもリラックスできる！',
  '鹿児島県へ旅立つ同僚に、鹿児島剣を授けたい 〜鍛冶屋はじめました〜',
  '木工職人が教える、DIYでケガを予防するための安全作業の鉄則11選',
  '【必見】ポスト、表札、物置まで！ カインズ限定ディズニーエクステリアは種類豊富で迷っちゃう！？',
  '美しすぎる「押しフルーツ」をつくってみたい！ プロのアドバイスを受けて挑戦したらまさかの作品が生まれた',
  '【ミジンコの増やし方】メダカの餌にするならミジンコの質が重要！ 東北大学・占部城太郎教授に聞く培養方法',
  '【迷わず選べる】プロ厳選の除草剤おすすめ5選｜種類や使い方を徹底解説',
  '車中泊マットにカインズの高反発ロングクッションflattyがぴったり説',
];

export const campaigns = [
  {
    title:
      'アサヒビール×カインズ 外でも「生ジョッキ缶」を楽しもう！キャンペーン【応募締切：2/6(月) 23:59】',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-08T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-02-06T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-07T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-01-30T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-77ash05.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_os_20221208-cp-asahi_:10379',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FMlbicy0OyakaFTmYZfZt%2Fimage.jpg?alt=media&token=5742da67-47ea-425f-967f-54496a86d6ea',
  },
  {
    title: '抽選で総計2,100名様にポイントや賞品が当たる！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-07-04T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-08-29T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-07-04T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-08-29T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-ashkrn02.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p1_os_20220704-cp-asahikirin_:10323',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FhhhpbJ31D6wdOlRPTN8W%2Fimage.jpg?alt=media&token=aa621eee-a14e-476e-a18c-263773d73c04',
  },
  {
    title: '【6/30ご購入分まで】600ポイントプレゼント！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-05-16T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-07-07T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-05-16T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-07-07T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-64ito02.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_os_20220516-itouen_:10303',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2Fx91mwAJrXekJd5EjwnIJ%2Fimage.jpg?alt=media&token=2be96a94-259d-423a-bef9-2f158b6c0541',
  },
  {
    title:
      'スプリングバレー豊潤＜496＞を飲んであなたのDIYを楽しもうキャンペーン【応募締切：11/14(日) 23：59】',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-09-27T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-11-14T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-09-27T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-11-07T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-77krn01.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_cp-kirinbeer210927_:10225',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FtlyWGCSw0Gq6xkAEzkzc%2Fimage.jpg?alt=media&token=d498e6da-adac-4dc1-b04c-1ad2f92e39a4',
  },
  {
    title:
      '【最大36,000ポイント】発売36周年キャンペーン開催中！【応募締切：5/15(日) 23：59】',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-03-02T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-05-15T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-03-02T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-05-08T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-77ash04.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p1_os_20220302-superdrycp_:10274',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FDPpLX9JVfJzpOne722Zw%2Fimage.jpg?alt=media&token=71380d0b-22b0-4409-bc6a-cc625683b940',
  },
  {
    title: 'カインズアプリで給油がお得に！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-07-02T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-09-30T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-07-02T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-09-30T00:00:00.000+09:00'),
    ),
    campaignUrl: '',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FBq9pS5xqstkDkyI63ehQ%2Fimage.jpg?alt=media&token=48728173-46da-40f6-9d0c-436dd65c0977',
  },
  {
    title: 'アサヒスーパードライ4ケースご購入で必ずもらえる！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-08-14T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-10-03T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-08-09T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-09-26T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-77ash01.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p1_cp-asahi210814_:10199',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FIjeFYT1DJrdWqOJtsACN%2Fimage.jpg?alt=media&token=8ef00b1d-8b14-4780-aca6-d0a12660c5bc',
  },
  {
    title: '【まもなく終了！】買えば買うほどとくとくキャンペーン！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-03-01T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-03-07T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-01-25T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-03-07T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/shop/e/e77spcp10/?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_cp-sapporo-tokutoku210301',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2Fl09tcXwGdHLPuoGeLLLK%2Fimage.jpg?alt=media&token=7fe5242f-9fb3-4da8-a7f5-3d903c8cc2c0',
  },
  {
    title:
      '【1,000ポイント】ポイントバックキャンペーン！【応募締切：10/18(火) 23：59】',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-09-15T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-10-18T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-09-14T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-10-18T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-itoash01.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_os_20220914-cp-itoen-asahi_:10350',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FDLq0pZ0dCjwM1WAYxkwU%2Fimage.jpg?alt=media&token=e46e84c6-0fcf-4ee4-a4d8-11efb265878d',
  },
  {
    title: '【ロゴキャップが当たる】カインズ限定キャンペーン',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-04-07T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-06-21T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-04-07T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2021-06-21T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/shop/e/e77nscp00/?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_cp-nisshuhan-logocap210407_:10060',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2F6GPD75AbK5FHZxNoCG4L%2Fimage.jpg?alt=media&token=33e9f644-1a8f-4a49-879a-5783bf4ab065',
  },
  {
    title: '【浦和美園店限定】ARスタンプラリーに参加して景品をゲットしよう！',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-01T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-25T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-01T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-25T00:00:00.000+09:00'),
    ),
    campaignUrl: '',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2Fph14VvAgQjSQsdKUUuQP%2Fimage.jpg?alt=media&token=102bf589-6411-4f98-9d96-65012a8334b6',
  },
  {
    title:
      'サッポロビール×カインズ 星をつかみとろう！キャンペーン【応募締切：2/20(月) 23:59】',
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-08T00:00:00.000+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-02-20T00:00:00.000+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2022-12-07T00:00:00.000+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-02-13T00:00:00.000+09:00'),
    ),
    campaignUrl:
      'https://www.cainz.com/contents/household-supplies/cp-77spr04.html?utm_source=ap&utm_medium=referral&utm_campaign=ap_p0_os_20221208-cp-sapporo_:10380',
    thumbnailUrl:
      'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/announcementByStore%2FUX8yYR4OM0VbTakgmyr5%2Fimage.jpg?alt=media&token=2a558b6d-5cda-4a0c-bda2-f6dd9011544d',
  },
];
