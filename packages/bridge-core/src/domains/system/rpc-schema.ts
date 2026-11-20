import { METHODS } from '../../rpc';
import type { ShareParams, ShareResult, CallPhoneParams, CallPhoneResult } from './types';

interface SystemRPCSchema {
  [METHODS.openSettings]: {
    params: {};
    result: { opened: boolean };
  };
  [METHODS.copyToClipboard]: {
    params: {
      text: string;
    };
    result: {
      copied: boolean;
    };
  };
  [METHODS.share]: {
    params: ShareParams;
    result: ShareResult;
  };
  [METHODS.callPhone]: {
    params: CallPhoneParams;
    result: CallPhoneResult;
  };
  [METHODS.setBlockingOverlay]: {
    params: {
      visible: boolean;
      message: string;
      /** 늦게 도착한 이전 표시 상태 요청을 무시하기 위한 단조 증가 순번 */
      requestId: number;
    };
    result: {
      visible: boolean;
    };
  };
  [METHODS.showConfirmDialog]: {
    params: {
      requestId: number;
      title: string;
      /** 있으면 title 대신 이걸 렌더링한다. accent: true인 조각은 강조색으로 표시 */
      titleParts?: { text: string; accent?: boolean }[];
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
    };
    result: {
      action: 'cancel' | 'confirm';
    };
  };
}

export type { SystemRPCSchema };
