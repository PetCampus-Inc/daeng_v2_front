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

export type { AddressSearchResult, AddressData };
