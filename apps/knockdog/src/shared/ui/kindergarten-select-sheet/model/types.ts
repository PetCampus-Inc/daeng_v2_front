interface KindergartenSelectOption {
  id: string;
  /** albums/{schoolId} 등 school 경로 API용 */
  schoolId: string;
  /** records?membershipId= 등 membership API용. 없으면 schoolId만으로 조회 */
  membershipId?: string | null;
  name: string;
  imageUrl: string;
  /** membership connectedAt `YYYY-MM-DD`. 없으면 records/home 하한 폴백 */
  attendedFrom?: string | null;
  /** null이면 현재 재원 중 */
  attendedUntil: string | null;
}

export type { KindergartenSelectOption };
