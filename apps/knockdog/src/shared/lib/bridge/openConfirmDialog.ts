import { BridgeException, METHODS } from '@knockdog/bridge-core';
import { getBridgeInstance } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';

interface ConfirmDialogTitlePart {
  text: string;
  accent?: boolean;
}

interface ConfirmDialogOptions {
  title: string;
  /** 있으면 title 대신 이걸 렌더링한다. accent: true인 조각은 강조색으로 표시 */
  titleParts?: ConfirmDialogTitlePart[];
  /** 제목이 두 줄 이상일 때만 해당 조각 뒤에서 줄바꿈한다. */
  titleLineBreakAfterPartIndex?: number;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  /** false면 취소 버튼 없이 확인 버튼 하나만 보여준다 (안내성 알림용). 기본 true */
  showCancelButton?: boolean;
  /** 확인 버튼 색상. 'accent'(주황, 기본) | 'neutral'(진회색) */
  confirmVariant?: 'accent' | 'neutral';
  /** 제목/설명/버튼 영역 좌우 패딩(px). 기본 20 */
  contentPaddingHorizontal?: number;
  /** 버튼 배치. 'horizontal'(좌우 한 줄, 기본) | 'vertical'(상하, 위가 취소·아래가 확인) */
  buttonLayout?: 'horizontal' | 'vertical';
  /**
   * 앱 확인창을 쓰지 않고 항상 호출한 화면의 웹 다이얼로그를 띄운다 ('unavailable'을 바로 돌려준다).
   * 제목·설명·버튼만으로 그릴 수 없는 예외 창에만 쓰고, `reason`에 왜 예외인지 반드시 적는다.
   * 웹 모달은 앱의 하단 탭바를 덮지 못하므로 탭바가 보이는 화면에는 쓰지 않는다.
   * 예외 목록은 `webOnly`로 검색한다.
   */
  webOnly?: { reason: string };
}

type ConfirmDialogResult =
  | { status: 'resolved'; action: 'cancel' | 'confirm' }
  /** 네이티브 미지원(구버전 앱 등)이거나 브릿지 요청 자체가 실패함 — 호출부가 기존 웹 다이얼로그로 폴백해야 함 */
  | { status: 'unavailable' }
  /** 사용자가 아직 네이티브 다이얼로그에 응답하지 않았을 뿐일 수 있어 아무 것도 하지 않아야 함 */
  | { status: 'pending' };

let lastConfirmDialogRequestId = 0;

/**
 * 네이티브 앱 안에서는 하단 탭바까지 덮는 네이티브 확인 다이얼로그를 띄운다.
 * 웹이거나 네이티브가 미지원이면 'unavailable'을 반환해 호출부가 기존 웹 AlertDialog로 폴백하게 한다.
 */
async function openConfirmDialog({ webOnly, ...options }: ConfirmDialogOptions): Promise<ConfirmDialogResult> {
  if (webOnly) return { status: 'unavailable' };
  if (!isNativeWebView()) return { status: 'unavailable' };

  const bridge = getBridgeInstance();
  if (!bridge) return { status: 'unavailable' };

  lastConfirmDialogRequestId = Math.max(Date.now(), lastConfirmDialogRequestId + 1);

  try {
    const { action } = await bridge.request(
      METHODS.showConfirmDialog,
      { requestId: lastConfirmDialogRequestId, ...options },
      { timeoutMs: 120_000 }
    );
    return { status: 'resolved', action };
  } catch (error) {
    if (error instanceof BridgeException && error.code === 'ETIMEDOUT') return { status: 'pending' };
    return { status: 'unavailable' };
  }
}

export { openConfirmDialog };
export type { ConfirmDialogOptions, ConfirmDialogResult, ConfirmDialogTitlePart };
