import { METHODS } from '../../rpc';
import type {
  AnalyticsLogEventParams,
  AnalyticsLogEventResult,
  AnalyticsLogScreenViewParams,
  AnalyticsLogScreenViewResult,
  AnalyticsSetUserIdParams,
  AnalyticsSetUserIdResult,
} from './types';

interface AnalyticsRPCSchema {
  [METHODS.analyticsLogEvent]: {
    params: AnalyticsLogEventParams;
    result: AnalyticsLogEventResult;
  };
  [METHODS.analyticsLogScreenView]: {
    params: AnalyticsLogScreenViewParams;
    result: AnalyticsLogScreenViewResult;
  };
  [METHODS.analyticsSetUserId]: {
    params: AnalyticsSetUserIdParams;
    result: AnalyticsSetUserIdResult;
  };
}

export type { AnalyticsRPCSchema };
