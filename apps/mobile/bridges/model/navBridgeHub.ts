import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

class NavBridgeHub {
  private waiters = new Map<string, RefObject<WebView>>();

  /**
   * A 스택에서 txId를 키로 등록 (B가 결과 보낼 대상)
   * 사용자가 다음 페이지에서 오래 머물 수 있으므로 타임아웃 없음
   */
  register(txId: string, webRef: RefObject<WebView>) {
    this.waiters.set(txId, webRef);
  }

  /** 조회 (삭제하지 않음) */
  get(txId: string) {
    return this.waiters.get(txId);
  }

  /** 결과/취소로 완료 시 정리 */
  resolve(txId: string) {
    this.waiters.delete(txId);
  }

  /** WebView unmount 시 해당 WebView가 기다리던 모든 txId 정리 */
  cleanup(webRef: RefObject<WebView>) {
    const txIdsToRemove: string[] = [];

    this.waiters.forEach((ref, txId) => {
      if (ref === webRef) {
        txIdsToRemove.push(txId);
      }
    });

    txIdsToRemove.forEach((txId) => {
      this.waiters.delete(txId);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[NavBridgeHub] cleanup txId on unmount:', txId);
      }
    });
  }

  /** 디버깅/전체 청소 */
  clear() {
    this.waiters.clear();
  }
}

export const navBridgeHub = new NavBridgeHub();
