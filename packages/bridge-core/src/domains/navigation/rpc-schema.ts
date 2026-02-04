import { METHODS } from '@/rpc';

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
}

export type { NavigationRPCSchema };