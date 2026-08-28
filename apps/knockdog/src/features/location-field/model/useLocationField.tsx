import { useState } from 'react';

import { pickJosa } from '../lib/josa';import { resolveAddressAlias, UserAddress, UserAddressType } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

interface UseLocationFieldOptions {
  type: UserAddressType;
  value?: Omit<UserAddress, 'id'>;
  addressId?: string;
  onChange?: (address?: Omit<UserAddress, 'id'>) => void;
  onAdd?: (address: Omit<UserAddress, 'id'>) => void | Promise<void>;
  onUpdate?: (address: Omit<UserAddress, 'id'>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

function showLocationResultToast(alias: string, suffix: string) {
  toast({
    type: 'success',
    shape: 'rounded',
    nativeTitle: `${alias}${suffix}`,
    titleParts: [
      { text: alias, accent: true },
      { text: suffix },
    ],
    title: (
      <>
        <span className='text-text-accent'>{alias}</span>
        {suffix}
      </>
    ),
  });
}

function showLocationErrorToast() {
  toast({
    title: '일시적 오류로 요청을 완료하지 못했어요',
    nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
  });
}

const useLocationField = ({ type, value, addressId, onChange, onAdd, onUpdate, onDelete }: UseLocationFieldOptions) => {
  // 주소는 react-hook-form이 소유한다. 별도 로컬 state를 두면 수정·삭제 순서에 따라
  // 이전 주소가 다시 렌더링될 수 있으므로 prop 값을 유일한 기준으로 사용한다.
  const address = value ?? null;
  const [isAdding, setIsAdding] = useState(false);

  const { pushForResult } = useStackNavigation();

  const navigateToAddressForm = async (params?: Record<string, unknown>, editAddressId?: string) => {
    let result: Omit<UserAddress, 'id'> | undefined;
    try {
      result = await pushForResult<Omit<UserAddress, 'id'>>(
        {
          pathname: route.register.location.add.root,
          query: { type, ...(editAddressId ? { addressId: editAddressId } : {}) },
          params,
        },
        600_000
      );
    } catch {
      // 등록 화면에서 저장하지 않고 뒤로 나간 경우. 사용자의 의도된 취소이므로 에러로 취급하지 않는다.
      return undefined;
    }
    // 뒤로가기 등으로 결과 없이 돌아오면 result가 falsy일 수 있다. 이때 form 값을
    // 갱신하면 수정 중이던 기존 주소가 지워지므로 무시한다.
    if (!result) return result;

    onChange?.(result);
    return result;
  };

  /** 추가하기 버튼 */
  const add = async () => {
    if (address) return;
    const result = await navigateToAddressForm();
    if (!result) return;

    try {
      setIsAdding(true);
      await onAdd?.(result);
      const resultAlias = resolveAddressAlias(type, result.alias);
      showLocationResultToast(resultAlias, `${pickJosa(resultAlias, '이', '가')} 추가되었습니다`);
    } catch (error) {
      onChange?.(undefined);
      console.error('장소 추가 실패:', error);
      showLocationErrorToast();
    } finally {
      setIsAdding(false);
    }
  };

  /** 수정 버튼 */
  const modify = async () => {
    if (!address) return;

    const previousAddress = address;

    const { alias: currentAlias, addressDetail, detail, ...restAddress } = address;
    const result = await navigateToAddressForm(
      {
        address: { ...restAddress, detail: detail?.trim() || addressDetail?.trim() || undefined },
        alias: currentAlias,
      },
      addressId
    );
    if (!result) return;

    try {
      await onUpdate?.(result);
      const resultAlias = resolveAddressAlias(type, result.alias);
      showLocationResultToast(resultAlias, `${pickJosa(resultAlias, '이', '가')} 수정되었습니다`);
    } catch (error) {
      onChange?.(previousAddress);
      console.error('장소 수정 실패:', error);
      showLocationErrorToast();
    }
  };

  const alias = resolveAddressAlias(type, address?.alias);

  /** 삭제 버튼 */
  const remove = async () => {
    const previousAddress = address;

    // 삭제 완료 후 store 갱신을 기다리기만 하면 react-hook-form이 갖고 있던
    // 수정 전 값이 계속 표시될 수 있다. 화면의 필드를 먼저 비우고, 요청 실패 시에만
    // 직전 값을 되돌린다.
    onChange?.(undefined);

    try {
      await onDelete?.();

      showLocationResultToast(alias, `${pickJosa(alias, '을', '를')} 삭제했어요`);
    } catch (error) {
      onChange?.(previousAddress ?? undefined);
      console.error('장소 삭제 실패:', error);
      showLocationErrorToast();
    }
  };

  return { alias, address, isAdding, add, modify, remove };
};

export { useLocationField };
