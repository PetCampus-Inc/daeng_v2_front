import type { KindergartenBasic } from '@entities/kindergarten';

// TODO(임시): MANUAL 유치원은 basic 데이터가 없어 UI 확인용 stub. BE 연동 시 제거.
const MANUAL_STUB_PHONE = '02-1234-5678';

const MANUAL_STUB_BASIC: KindergartenBasic = {
  id: '',
  roadAddress: '부산광역시 동구 홍곡로 53 (수정동)',
  coord: { lat: 35.1506, lng: 129.0366 },
  operationTimes: [
    {
      serviceTags: 'DEFAULT',
      weekday: [
        { time: '09:00', breakTime: '' },
        { time: '20:00', breakTime: '' },
      ],
      weekend: [
        { time: '', breakTime: '10:00' },
        { time: '', breakTime: '18:00' },
      ],
      closedDays: ['SUNDAY'],
    },
  ],
  dogBreeds: ['ALL_BREEDS'],
  dogServices: [
    'DAYCARE',
    'HOTEL',
    'STAY_24H',
    'TEMPERAMENT',
    'SPLIT_CLASS',
    'BATH_SERVICE',
    'WALK',
    'TRAINING',
    'GROOMING',
    'REHABILITATION',
  ],
  dogSafetyFacilities: ['CCTV', 'NON_SLIP', 'PLAYGROUND'],
  visitorAmenities: ['PARKING', 'PICK_DROP', 'DIARY'],
  homepageUrl: 'https://example.com',
  instagramUrl: 'https://instagram.com/example',
  youtubeUrl: '',
  lastUpdatedAt: '2026-07-13',
};

export { MANUAL_STUB_BASIC, MANUAL_STUB_PHONE };
