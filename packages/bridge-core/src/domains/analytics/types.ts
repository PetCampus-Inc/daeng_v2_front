/** Firebase Analytics logEvent params — GA4 예약/커스텀 파라미터 */
type AnalyticsParamValue = string | number | boolean;

interface AnalyticsLogEventParams {
  name: string;
  params?: Record<string, AnalyticsParamValue>;
}

interface AnalyticsLogEventResult {
  ok: boolean;
}

/** Firebase Analytics screen_view — GA4페이지 제목 및 화면 클래스에 반영 */
interface AnalyticsLogScreenViewParams {
  /** GA screen_name / 웹 page_title */
  screen_name: string;
  screen_class?: string;
  params?: Record<string, AnalyticsParamValue>;
}

interface AnalyticsLogScreenViewResult {
  ok: boolean;
}

/** Firebase setUserId. null이면 로그아웃/계정 전환으로 식별을 지운다. */
interface AnalyticsSetUserIdParams {
  user_id: string | null;
}

interface AnalyticsSetUserIdResult {
  ok: boolean;
}

export type {
  AnalyticsLogEventParams,
  AnalyticsLogEventResult,
  AnalyticsLogScreenViewParams,
  AnalyticsLogScreenViewResult,
  AnalyticsSetUserIdParams,
  AnalyticsSetUserIdResult,
  AnalyticsParamValue,
};
