'use client';

import { useState } from 'react';
import { Header } from '@widgets/Header';
import { ActionButton, RadioGroup, RadioGroupItem, Textarea, TextareaInput } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

function WithdrawSurveyPage() {
  const { back } = useStackNavigation();
  const [selectedValue, setSelectedValue] = useState<string>('');

  return (
    <>
      <Header>
        <Header.CloseButton onClick={back} />
        <Header.Title>똑독 회원 탈퇴</Header.Title>
      </Header>

      <div className='px-4'>
        <div className='mb-4'>
          <h1 className='h1-extrabold'>똑독을 떠나시는 이유가 궁금해요.</h1>
        </div>

        <RadioGroup className='gap-0' value={selectedValue} onValueChange={setSelectedValue}>
          <RadioGroupItem value='1'>
            <div className='h3-medium py-4'>정보가 부정확해요</div>
          </RadioGroupItem>
          {selectedValue === '1' && (
            <div className='flex gap-x-2'>
              <ActionButton variant='secondaryLine' size='large' className='w-full'>
                더 둘러보기
              </ActionButton>
              <ActionButton variant='secondaryFill' size='large' className='w-full'>
                탈퇴하기
              </ActionButton>
            </div>
          )}
          <RadioGroupItem value='2'>
            <div className='h3-medium py-4'>탐색 경험이 불편해요</div>
          </RadioGroupItem>
          {selectedValue === '2' && (
            <div className='flex gap-x-2'>
              <ActionButton variant='secondaryLine' size='large' className='w-full'>
                더 둘러보기
              </ActionButton>
              <ActionButton variant='secondaryFill' size='large' className='w-full'>
                탈퇴하기
              </ActionButton>
            </div>
          )}

          <RadioGroupItem value='3'>
            <div className='h3-medium py-4'>필요한 기능이 부족해요</div>
          </RadioGroupItem>
          {selectedValue === '3' && (
            <div className='mb-6'>
              <div className='bg-fill-secondary-50 mb-3 rounded-lg px-4 py-5'>
                <span className='body1-regular py-4'>
                  아직 없어서 불편했던 기능이 무엇인지 알려주실 수 있나요? 여러분의 의견을 바탕으로 서비스가 더 좋아질
                  수 있어요! 조금 더 기다려 주실 수 있을까요?
                </span>

                <ActionButton className='mt-4'>아이디어 • 기능 제안하기</ActionButton>
              </div>
              <div className='flex gap-x-2'>
                <ActionButton variant='secondaryLine' size='large' className='w-full'>
                  더 둘러보기
                </ActionButton>
                <ActionButton variant='secondaryFill' size='large' className='w-full'>
                  탈퇴하기
                </ActionButton>
              </div>
            </div>
          )}

          <RadioGroupItem value='4'>
            <div className='h3-medium py-4'>기타</div>
          </RadioGroupItem>
          {selectedValue === '4' && (
            <div>
              <Textarea className='mb-3' rows={3}>
                <TextareaInput placeholder='소중한 의견을 바탕으로 더 좋은 서비스를 제공하는 똑독이 되도록 노력할게요.' />
              </Textarea>
              <div className='flex gap-x-2'>
                <ActionButton variant='secondaryLine' size='large' className='w-full'>
                  더 둘러보기
                </ActionButton>
                <ActionButton variant='secondaryFill' size='large' className='w-full'>
                  탈퇴하기
                </ActionButton>
              </div>
            </div>
          )}
        </RadioGroup>
      </div>
    </>
  );
}

export { WithdrawSurveyPage };
