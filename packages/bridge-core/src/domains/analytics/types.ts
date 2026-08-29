/** Firebase Analytics logEvent params — GA4 예약/커스텀 파라미터 */
type AnalyticsParamValue = string | number | boolean;

interface AnalyticsLogEventParams {
  name: string;
  params?: Record<string, AnalyticsParamValue>;
}

interface AnalyticsLogEventResult {
  ok: boolean;
}

export type { AnalyticsLogEventParams, AnalyticsLogEventResult, AnalyticsParamValue };
