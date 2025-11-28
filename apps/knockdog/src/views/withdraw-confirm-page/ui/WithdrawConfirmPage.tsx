'use client';

import { useState, useMemo } from 'react';
import { Header } from '@widgets/Header';
import { Divider, Checkbox, ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import Image from 'next/image';

function WithdrawConfirmPage() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false]);
  const { back, push } = useStackNavigation();

  const isAllChecked = useMemo(() => checkedItems.every(Boolean), [checkedItems]);

  function handleSelectAll(checked: boolean) {
    setCheckedItems([checked, checked]);
  }

  function handleItemChange(index: number, checked: boolean) {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = checked;
      return newItems;
    });
  }

  return (
    <>
      <Header>
        <Header.CloseButton onClick={back} />
        <Header.Title>똑독 회원 탈퇴</Header.Title>
      </Header>

      <div className='flex h-full flex-col justify-between px-4'>
        <div>
          <div className='py-4'>
            <h1 className='h1-extrabold'>똑독을 떠난다니 너무 아쉬워요.</h1>
          </div>

          <div className='flex items-center justify-center'>
            <Image src='/images/img_withdraw.png' alt='withdraw-confirm' width={140} height={140} />
          </div>

          <div className='flex flex-col gap-y-1 py-10'>
            <div className='py-2'>
              <Checkbox size='sm' checked={isAllChecked} onCheckedChange={handleSelectAll}>
                <div className='h3-semibold'>전체 선택</div>
              </Checkbox>
            </div>
            <Divider />
            <div className='py-2'>
              <Checkbox size='sm' checked={checkedItems[0]} onCheckedChange={(checked) => handleItemChange(0, checked)}>
                <div className='body1-regular'>탈퇴 후 7일 동안 다시 가입할 수 없어요. </div>
              </Checkbox>
            </div>

            <div className='py-2'>
              <Checkbox size='sm' checked={checkedItems[1]} onCheckedChange={(checked) => handleItemChange(1, checked)}>
                <div className='body1-regular'>모든 데이터는 즉시 삭제되며 복구할 수 없어요. </div>
              </Checkbox>
            </div>
          </div>
        </div>

        <ActionButton
          size='large'
          className='my-5 w-full'
          disabled={!isAllChecked}
          onClick={async () =>
            await push({
              pathname: '/withdraw/survey',
            })
          }
        >
          확인했어요
        </ActionButton>
      </div>
    </>
  );
}

export { WithdrawConfirmPage };
