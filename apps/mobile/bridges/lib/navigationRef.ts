import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * 네비게이션 준비 여부 확인
 * @returns boolean
 */
function isNavReady() {
  return navigationRef.isReady();
}

export { navigationRef, isNavReady };
