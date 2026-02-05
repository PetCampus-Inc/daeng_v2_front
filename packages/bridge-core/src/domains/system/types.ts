type ShareMandatory =
  | {
      url: string;
      message?: string;
    }
  | {
      url?: string;
      message: string;
    };

type ShareParams = ShareMandatory & {
  subject?: string;
  excludedActivityTypes?: string[];
  tintColor?: string;

  title?: string;
  dialogTitle?: string;
};

type ShareResult = {
  shared: boolean;
  activityType?: string;
};

type CallPhoneParams = {
  phoneNumber: string;
};

type CallPhoneResult = {
  opened: boolean;
  /**
   * 시뮬레이터에서 실행된 경우
   */
  simulated?: boolean; 
};

export type { ShareParams, ShareResult, CallPhoneParams, CallPhoneResult };
