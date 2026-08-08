interface GuardianConnectionHistoryItem {
  id: string;
  kindergartenId: string;
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
}

export type { GuardianConnectionHistoryItem };
