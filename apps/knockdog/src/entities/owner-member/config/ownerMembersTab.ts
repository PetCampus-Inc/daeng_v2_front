/** 구성원 화면의 탭을 정하는 주소 쿼리 이름 (`/owner/members?tab=pending`) */
const OWNER_MEMBERS_TAB_QUERY_KEY = 'tab';

/** 구성원 화면의 탭 값 */
const OWNER_MEMBERS_TAB = {
  registered: 'registered',
  pending: 'pending',
} as const;

type OwnerMembersTab = (typeof OWNER_MEMBERS_TAB)[keyof typeof OWNER_MEMBERS_TAB];

export { OWNER_MEMBERS_TAB, OWNER_MEMBERS_TAB_QUERY_KEY };
export type { OwnerMembersTab };
