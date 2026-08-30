import type { ShareParams } from './types';

export interface SystemEventMap {
  'system.openExternalLink': { url: string };
  'system.openSystemSetting': undefined;
  'system.share': ShareParams;
  /** 이 WebView(네이티브 스크롤뷰)의 자동 스크롤/keyboard 회피 동작을 켜고 끈다.
   * 포커스된 입력을 보여주려 웹뷰 전체가 스크롤되는 걸, 자체 스크롤 UX를 구현한
   * 화면에서 막기 위함. 이 이벤트를 보낸 WebView 인스턴스에만 적용된다. */
  'system.setWebViewScrollEnabled': { enabled: boolean };
}
