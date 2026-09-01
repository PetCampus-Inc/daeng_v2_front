import { METHODS } from '../../rpc';

interface NavigationRPCSchema {
  [METHODS.navPush]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
    result: {
      pushed: boolean;
    };
  };
  [METHODS.navBack]: {
    params: {};
    result: {
      wentBack: boolean;
    };
  };
  [METHODS.navReplace]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
  };
  [METHODS.navReset]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
    result: {
      reset: boolean;
    };
  };
  [METHODS.navSwitchTab]: {
    params: {
      pathname: string;
      query?: Record<string, unknown>;
      /** Stack 화면에서 특정 모드의 탭으로 이동해야 할 때, 탭 이름 계산 전에 먼저
       * 반영할 메인탭 모드. navSetMainTabMode와 달리 이 요청은 Stack 화면에서도
       * 항상 적용된다(전환 직후 도착 탭을 즉시 결정하기 위함). */
      mode?: 'owner' | 'guardian';
    };
    result: {
      switched: boolean;
    };
  };
  [METHODS.navSetMainTabMode]: {
    params: {
      mode: 'owner' | 'guardian';
      /** 늦게 도착한 이전 모드 요청을 무시하기 위한 단조 증가 순번 */
      requestId: number;
      /** 원장 인증 완료처럼 Stack 화면에서 네이티브 모드를 선반영해야 하는 경우 */
      force?: boolean;
    };
    result: {
      mode: 'owner' | 'guardian';
    };
  };
  [METHODS.navSetBottomTabBarVisible]: {
    params: {
      visible: boolean;
      /** 늦게 도착한 이전 표시 상태 요청을 무시하기 위한 단조 증가 순번 */
      requestId: number;
    };
    result: {
      visible: boolean;
    };
  };
  [METHODS.navSetBottomTabBarDimmed]: {
    params: {
      dimmed: boolean;
      /** 늦게 도착한 이전 딤 상태 요청을 무시하기 위한 단조 증가 순번 */
      requestId: number;
    };
    result: {
      dimmed: boolean;
    };
  };
}

export type { NavigationRPCSchema };
