'use client';

import { useEffect } from 'react';

const NATIVE_BACK_EVENT = 'knockdog:native-back';

/**
 * 안드로이드 시스템 뒤로가기(네이티브 BackHandler)를 웹 핸들러로 연결한다.
 * 핸들러가 등록된 동안 이벤트를 preventDefault 해 네이티브 기본 pop을 막는다.
 * (미등록 화면은 네이티브가 unhandled 메시지를 받아 기존처럼 goBack)
 */
function useNativeBackHandler(handler: () => void) {
  useEffect(() => {
    const onNativeBack = (event: Event) => {
      event.preventDefault();
      handler();
    };

    window.addEventListener(NATIVE_BACK_EVENT, onNativeBack);
    return () => window.removeEventListener(NATIVE_BACK_EVENT, onNativeBack);
  }, [handler]);
}

export { useNativeBackHandler, NATIVE_BACK_EVENT };
