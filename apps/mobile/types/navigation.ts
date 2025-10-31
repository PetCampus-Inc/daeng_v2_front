interface InitialState {
  _txId?: string;
  _params?: unknown;
  query?: Record<string, unknown>;
}

type RootStackParamList = {
  Tabs: undefined;
  Stack: {
    path: string;
    initialState?: InitialState;
  };
};

export type { InitialState, RootStackParamList };
