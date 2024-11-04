import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 두 이벤트 핸들러를 결합하는 함수입니다.
 * - originalEventHandler: 원래의 이벤트 핸들러로, 먼저 실행됩니다.
 * - ourEventHandler: 추가적으로 실행할 이벤트 핸들러로, 기본 동작이 막히지 않은 경우에만 실행됩니다.
 * - checkForDefaultPrevented: true일 경우, originalEventHandler에서 이벤트가 기본 동작이 막혔는지 확인 후,
 *   막히지 않았을 때만 ourEventHandler를 실행합니다.
 *
 * @param originalEventHandler 원래의 이벤트 핸들러
 * @param ourEventHandler 추가적인 이벤트 핸들러
 * @param checkForDefaultPrevented 기본 동작 막힘 여부 확인 옵션 (기본값: true)
 * @returns 결합된 이벤트 핸들러
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}
