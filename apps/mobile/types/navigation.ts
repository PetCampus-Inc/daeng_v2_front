interface InitialState {
  _txId?: string;
  _params?: unknown;
  query?: Record<string, unknown>;
}

type RootStackParamList = {
  Tabs:
    | undefined
    | {
        screen?: 'Explore' | 'Save' | 'Compare' | 'Mypage';
      };
  Stack: {
    path: string;
    initialState?: InitialState;
  };
};

export type { InitialState, RootStackParamList };
