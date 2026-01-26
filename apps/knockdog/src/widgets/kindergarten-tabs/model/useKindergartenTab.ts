import { useQueryState } from 'nuqs';

/**
 * 유치원 탭 상태를 Query String으로 관리하는 커스텀 훅
 *
 * @returns [activeTab, setActiveTab] - 현재 활성 탭과 탭 변경 함수
 *
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useKindergartenTab();
 * setActiveTab('후기'); // URL: ?tab=후기
 * ```
 */
export function useKindergartenTab() {
  return useQueryState('tab', {
    defaultValue: '기본정보',
    shallow: true,
  });
}
