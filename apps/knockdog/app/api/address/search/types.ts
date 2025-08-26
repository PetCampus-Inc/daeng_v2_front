export interface AddressSearchParams {
  keyword: string;
  currentPage: string;
  countPerPage: string;
  resultType: 'xml' | 'json';
  hstryYn: 'Y' | 'N';
  firstSort: 'none' | 'road' | 'location';
  addInfoYn: 'Y' | 'N';
}

export interface AddressSearchResult {
  results: {
    common: {
      totalCount: string;
      currentPage: string;
      countPerPage: string;
      errorCode: string;
      errorMessage: string;
    };
    juso: Array<{
      roadAddr: string;
      roadAddrPart1: string;
      roadAddrPart2: string;
      jibunAddr: string;
      engAddr: string;
      zipNo: string;
      admCd: string;
      rnMgtSn: string;
      bdMgtSn: string;
      detBdNmList: string;
      bdNm: string;
      bdKdcd: string;
      siNm: string;
      sggNm: string;
      emdNm: string;
      liNm: string;
      rn: string;
      udrtYn: string;
      buldMnnm: string;
      buldSlno: string;
      mtYn: string;
      lnbrMnnm: string;
      lnbrSlno: string;
      emdNo: string;
      hstryYn?: string;
      relJibun?: string;
      hemdNm?: string;
    }>;
  };
}

export interface AddressSearchError {
  error: string;
  details?: string;
}
