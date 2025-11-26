/** 주소 */
interface Address {
  /** 필지 고유 번호 */
  pnu: string;
  /** 지번 주소 */
  address: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 상세 주소 */
  detail?: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
}

/** 위도, 경도 좌표 */
interface LatLng {
  lat: number;
  lng: number;
}

interface AddressSearchResult {
  results: {
    common: {
      totalCount: string;
      currentPage: string;
      countPerPage: string;
      errorCode: string;
      errorMessage: string;
    };
    juso?: Array<{
      roadAddr?: string;
      jibunAddr?: string;
      zipNo: string;
      admCd: string;
      rnMgtSn: string;
      bdMgtSn?: string;
      detBdNmList?: string;
      bdNm?: string;
      admNm: string;
      udrtYn: string;
      lnbrMgtSn: string;
      emdNm: string;
      buldMnnm?: string;
      buldSlno?: string;
      mtYn: string;
      lnbrCd: string;
      emdCd: string;
      siNm: string;
      sggNm: string;
      zipCd: string;
      liNm?: string;
      rn?: string;
      rnCd?: string;
      pnu?: string;
      bdKdcd?: string;
      sggBuldNm?: string;
      emdNo?: string;
      hstryYn?: string;
      relatedJibun?: string;
      relatedRoad?: string;
    }>;
  };
}

interface AddressData {
  roadAddr: string;
  jibunAddr: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
  zipNo: string;
}

export type { Address, LatLng, AddressSearchResult, AddressData };
