interface OwnerMemberConnectionHistoryItem {
  id: string;
  /** 연결 신청 승인일 `YYYY-MM-DD` */
  connectedAt: string;
  /** 연결 해제일 `YYYY-MM-DD`. null이면 현재 연결 중 */
  disconnectedAt: string | null;
  /** 기간 내 실제 등원 처리 횟수 총합 */
  attendanceDayCount: number;
}

export type { OwnerMemberConnectionHistoryItem };
