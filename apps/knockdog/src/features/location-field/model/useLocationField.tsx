import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { useEffect, useState } from 'react';

import { pickJosa } from '../lib/josa';

interface UseLocationFieldOptions {
  type: UserAddressType;
  value?: Omit<UserAddress, 'id'>;
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

const useLocationField = ({ type, value, onChange, onAdd, onUpdate, onDelete }: UseLocationFieldOptions) => {
  const [address, setAddress] = useState<Omit<UserAddress, 'id'> | null>(value ?? null);

  const { pushForResult } = useStackNavigation();

  // value prop이 변경되면 address 업데이트
  useEffect(() => {
    setAddress(value ?? null);
  }, [value]);

  const navigateToAddressForm = async (params?: Record<string, unknown>) => {
    const result = await pushForResult<Omit<UserAddress, 'id'>>(
      {
        pathname: route.register.location.add.root,
        query: { type },
        params,
      },
      600_000
    );
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

    const { alias: currentAlias, ...restAddress } = address;
    const result = await navigateToAddressForm({ address: restAddress, alias: currentAlias });
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
    try {
      await onDelete?.();

      // 로컬 state를 직접 지우지 않는다. 삭제 뮤테이션 성공 시 상위(store)의 주소 목록이
      // 갱신되고, 그 값이 value prop → 위 useEffect를 통해 자연스럽게 반영된다.
      // 여기서 setAddress/onChange를 같이 호출하면 상위 값 반영과 경합해
      // 간헐적으로 삭제한 주소가 다시 나타나는 문제가 있었다.
      showLocationResultToast(alias, `${pickJosa(alias, '을', '를')} 삭제했어요`);
    } catch (error) {
      console.error('장소 삭제 실패:', error);
      showLocationErrorToast();
    }
  };

  return { alias, address, add, modify, remove };
};

export { useLocationField };
