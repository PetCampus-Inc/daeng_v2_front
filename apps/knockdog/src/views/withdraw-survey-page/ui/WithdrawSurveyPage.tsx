'use client';

import { useState, useRef } from 'react';
import { createParser, useQueryState } from 'nuqs';
import { ActionButton, RadioGroup, RadioGroupItem, Textarea, TextareaInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { WITHDRAW_REASON_TYPE, type WithdrawReasonType, type WithdrawRequest } from '@entities/user';
import { useStackNavigation, useOpenExternalLink  } from '@shared/lib/bridge';
import { trackAccountDeactivation } from '@shared/lib/analytics';
import { withdraw } from '@shared/lib/auth';
import { route } from '@shared/constants/route';

import { EXTERNAL_LINKS } from '@shared/constants';

const REASON_TYPE_PARSER = createParser<WithdrawReasonType>({
  parse: (value: string) => {
    if (!value) return null;
    const validTypes = Object.values(WITHDRAW_REASON_TYPE);
    return validTypes.includes(value as WithdrawReasonType) ? (value as WithdrawReasonType) : null;
  },
  serialize: (value) => value,
});

const REASON_TYPE_MAP: Record<string, WithdrawReasonType> = {
  '1': WITHDRAW_REASON_TYPE.INACCURATE_INFO,
  '2': WITHDRAW_REASON_TYPE.POOR_UX,
  '3': WITHDRAW_REASON_TYPE.MISSING_FEATURE,
  '4': WITHDRAW_REASON_TYPE.OTHER,
} as const;

function toWithdrawalGaReason(reasonType: WithdrawReasonType) {
  switch (reasonType) {
    case WITHDRAW_REASON_TYPE.INACCURATE_INFO:
      return 'inaccurate_info';
    case WITHDRAW_REASON_TYPE.POOR_UX:
      return 'bad_exploration';
    case WITHDRAW_REASON_TYPE.MISSING_FEATURE:
      return 'missing_features';
    default:
      return 'other';
  }
}

function WithdrawSurveyPage() {
  const { back, reset } = useStackNavigation();
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [reasonType, setReasonType] = useQueryState('reasonType', REASON_TYPE_PARSER);
  const [isPending, setIsPending] = useState(false);
  const reasonTextRef = useRef<HTMLTextAreaElement>(null);
  const openExternalLink = useOpenExternalLink();


  const handleSuggestionClick = () => {
    openExternalLink(EXTERNAL_LINKS.SUGGESTION);
  };

  function handleReasonChange(value: string) {
    setSelectedValue(value);
    const mappedReasonType = REASON_TYPE_MAP[value];
    if (mappedReasonType) {
      setReasonType(mappedReasonType);
    }
  }

  async function handleWithdraw() {
    if (!reasonType || isPending) return;

    const reasonText = reasonTextRef.current?.value?.trim();
    const request: WithdrawRequest = {
      reasonType,
      ...(reasonText && { detail: reasonText }),
    };

    setIsPending(true);
    try {
      await withdraw(request);
      trackAccountDeactivation({
        action: 'withdrawal',
        reason: toWithdrawalGaReason(reasonType),
      });
      await reset(route.auth.login.root);
    } catch (error) {
      console.error('탈퇴 처리 중 오류 발생:', error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.CloseButton onClick={back} />
        <Header.Title>똑독 회원 탈퇴</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        <div className='py-4'>
          <h1 className='h1-extrabold'>똑독을 떠나시는 이유가 궁금해요.</h1>
        </div>

        <RadioGroup className='gap-0' value={selectedValue} onValueChange={handleReasonChange}>
          <RadioGroupItem value='1'>
            <div className='h3-medium py-4'>정보가 부정확해요</div>
          </RadioGroupItem>

          <RadioGroupItem value='2'>
            <div className='h3-medium py-4'>탐색 경험이 불편해요</div>
          </RadioGroupItem>

          <RadioGroupItem value='3'>
            <div className='h3-medium py-4'>필요한 기능이 부족해요</div>
          </RadioGroupItem>
          {selectedValue === '3' && (
            <div className='bg-fill-secondary-50 mb-6 rounded-lg px-4 py-5'>
              <span className='body1-regular py-4'>
                아직 없어서 불편했던 기능이 무엇인지 알려주실 수 있나요? 여러분의 의견을 바탕으로 서비스가 더 좋아질 수
                있어요! 조금 더 기다려 주실 수 있을까요?
              </span>

              <ActionButton className='mt-4' onClick={handleSuggestionClick}>
                아이디어 • 기능 제안하기
              </ActionButton>
            </div>
          )}

          <RadioGroupItem value='4'>
            <div className='h3-medium py-4'>기타</div>
          </RadioGroupItem>
          {selectedValue === '4' && (
            <Textarea className='mb-6' rows={3}>
              <TextareaInput
                ref={reasonTextRef}
                placeholder='소중한 의견을 바탕으로 더 좋은 서비스를 제공하는 똑독이 되도록 노력할게요.'
              />
            </Textarea>
          )}
        </RadioGroup>
      </div>

      <div className='shrink-0 flex gap-x-2 px-4 py-5'>
        <ActionButton variant='secondaryLine' size='large' className='w-full' onClick={back}>
          더 둘러보기
        </ActionButton>
        <ActionButton
          variant='secondaryFill'
          size='large'
          className='w-full'
          onClick={handleWithdraw}
          disabled={!selectedValue || isPending}
        >
          탈퇴하기
        </ActionButton>
      </div>
    </div>
  );
}

export { WithdrawSurveyPage };
