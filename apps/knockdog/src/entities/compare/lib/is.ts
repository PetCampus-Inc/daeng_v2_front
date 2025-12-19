import { SelectedIds } from '../model/compare';

/** SelectedIds 타입 가드 함수 */
function isSelectedIds(value: unknown): value is SelectedIds {
  return (
    typeof value === 'object' &&
    value !== null &&
    'left' in value &&
    'right' in value &&
    (value.left === null || typeof value.left === 'string') &&
    (value.right === null || typeof value.right === 'string')
  );
}

export { isSelectedIds };
