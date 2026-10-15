interface GuardianConnectionHistoryItem {
  id: string;
  /** 연결 해제 API path id. 현재 연결인데 없으면 해제 요청 불가 */
  schoolPetMembershipId: string | null;
  kindergartenId: string;
  /** 리뷰 작성 경로. 없으면 작성 버튼을 숨긴다 */
  placeId: string | null;
  name: string;
  /** 상세주소 생략된 표기용 주소 */
  address: string;
  imageUrl: string;
  /** 연결 시작일 `YYYY-MM-DD` */
  connectedAt: string;
  /** 연결 해제일 `YYYY-MM-DD`. null이면 현재 연결 중 */
  disconnectedAt: string | null;
  /** 뱃지용 총 연결(등원) 일수 */
  attendanceDayCount: number;
  /** 서버가 이 연결에 리뷰 작성을 허용했는지 */
  canWriteReview: boolean;
}

export type { GuardianConnectionHistoryItem };
