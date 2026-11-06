interface InitialState {
  _txId?: string;
  _params?: unknown;
  query?: Record<string, unknown>;
}

type TabScreen =
  | 'Explore'
  | 'Save'
  | 'Compare'
  | 'Mypage'
  | 'OwnerHome'
  | 'OwnerDaily'
  | 'OwnerAlbum'
  | 'OwnerMembers';

type RootStackParamList = {
  Tabs:
    | undefined
    | {
        screen?: TabScreen;
      };
  Stack: {
    path: string;
    initialState?: InitialState;
  };
};

export type { InitialState, RootStackParamList, TabScreen };
