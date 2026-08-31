import { METHODS } from '../../rpc';
import type {
  AnalyticsLogEventParams,
  AnalyticsLogEventResult,
  AnalyticsLogScreenViewParams,
  AnalyticsLogScreenViewResult,
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
}

export type { AnalyticsRPCSchema };
