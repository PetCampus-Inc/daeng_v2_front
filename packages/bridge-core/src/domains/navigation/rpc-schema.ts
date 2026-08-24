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
    };
    result: {
      switched: boolean;
    };
  };
  [METHODS.navSetMainTabMode]: {
    params: {
      mode: 'owner' | 'guardian';
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
}

export type { NavigationRPCSchema };
