interface KindergartenSelectOption {
  id: string;
  /** albums/{schoolId}, records?schoolId= 등 school 경로 API용 */
  schoolId: string;
  /** 사이클 단위 이력이 필요할 때만. school 스코프 API에는 사용하지 않음 */
  membershipId?: string | null;
  name: string;
  imageUrl: string;
  /** membership connectedAt `YYYY-MM-DD`. 없으면 records/home 하한 폴백 */
  attendedFrom?: string | null;
  /** null이면 현재 재원 중 */
  attendedUntil: string | null;
}

export type { KindergartenSelectOption };
