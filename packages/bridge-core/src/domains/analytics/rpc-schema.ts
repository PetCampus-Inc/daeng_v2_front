import { METHODS } from '../../rpc';
import type { AnalyticsLogEventParams, AnalyticsLogEventResult } from './types';

interface AnalyticsRPCSchema {
  [METHODS.analyticsLogEvent]: {
    params: AnalyticsLogEventParams;
    result: AnalyticsLogEventResult;
  };
}

export type { AnalyticsRPCSchema };
