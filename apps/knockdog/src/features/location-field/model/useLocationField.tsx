import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { useEffect, useState } from 'react';

import { pickJosa } from '../lib/josa';

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
  const [address, setAddress] = useState<Omit<UserAddress, 'id'> | null>(value ?? null);

  const { pushForResult } = useStackNavigation();

  // value prop이 변경되면 address 업데이트
  useEffect(() => {
    setAddress(value ?? null);
  }, [value]);

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
    // 뒤로가기 등으로 결과 없이 돌아오면 result가 falsy일 수 있다. 이때 그대로
    // setAddress/onChange를 호출하면 수정 중이던 기존 주소가 로컬에서 지워지므로 무시한다.
    if (!result) return result;

    setAddress(result);
    onChange?.(result);
    return result;
  };

  /** 추가하기 버튼 */
  const add = async () => {
    if (address) return;
    const result = await navigateToAddressForm();
    if (!result) return;

    try {
      await onAdd?.(result);
      const resultAlias = result.alias || USER_ADDRESS_TYPE_KR[type];
      showLocationResultToast(resultAlias, `${pickJosa(resultAlias, '이', '가')} 추가되었습니다`);
    } catch (error) {
      console.error('장소 추가 실패:', error);
      showLocationErrorToast();
    }
  };

  /** 수정 버튼 */
  const modify = async () => {
    if (!address) return;

    const { alias: currentAlias, addressDetail, detail, ...restAddress } = address;
    const result = await navigateToAddressForm(
      {
        address: { ...restAddress, detail: detail ?? addressDetail },
        alias: currentAlias,
      },
      addressId
    );
    if (!result) return;

    try {
      await onUpdate?.(result);
      const resultAlias = result.alias || USER_ADDRESS_TYPE_KR[type];
      showLocationResultToast(resultAlias, `${pickJosa(resultAlias, '이', '가')} 수정되었습니다`);
    } catch (error) {
      console.error('장소 수정 실패:', error);
      showLocationErrorToast();
    }
  };

  const alias = address?.alias || USER_ADDRESS_TYPE_KR[type];

  /** 삭제 버튼 */
  const remove = async () => {
    const previousAddress = address;

    setAddress(null);
    onChange?.(undefined);

    try {
      await onDelete?.();

      showLocationResultToast(alias, `${pickJosa(alias, '을', '를')} 삭제했어요`);
    } catch (error) {
      setAddress(previousAddress);
      onChange?.(previousAddress ?? undefined);
      console.error('장소 삭제 실패:', error);
      showLocationErrorToast();
    }
  };

  return { alias, address, add, modify, remove };
};

export { useLocationField };
