'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { ActionButton, Textarea, TextareaInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useMypageRoleView, useOwnerRole } from '@features/role-conversion';
import { SupportUserTypeField, type SupportUserType } from '@features/support';
import { IDEA_CONTENT_MAX_LENGTH, useIdeaSuggestionMutation } from '@entities/idea-suggestion';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { ActionLoadingOverlay, ACTION_SPINNER_DELAY_MS } from '@shared/ui/loading-spinner';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

/** 아이디어 제안 작성. 사용자 유형과 내용만 받는다 (PRD 7.5) */
function IdeaSuggestionWritePage() {
  const { back, replace } = useStackNavigation();
  const submitSuggestion = useIdeaSuggestionMutation();

  // 사용자 유형 초기값: 진입한 마이페이지의 현재 모드. 모드를 확인하기 전에는 미선택으로 둔다
  const { isResolved: isOwnerRoleResolved } = useOwnerRole();
  const { isOwnerView } = useMypageRoleView();
  const [selectedUserType, setSelectedUserType] = useState<SupportUserType | null | undefined>(undefined);
  const initialUserType: SupportUserType | null = isOwnerRoleResolved ? (isOwnerView ? 'OWNER' : 'GUARDIAN') : null;
  const userType = selectedUserType === undefined ? initialUserType : selectedUserType;

  const [content, setContent] = useState('');
  const isSubmittingRef = useRef(false);
  // 성공 후 화면을 떠날 때까지 잠금을 유지한다. 풀면 이동 전에 작성 화면이 다시 보인다
  const [isLeaving, setIsLeaving] = useState(false);
  // 같은 내용을 다시 보내면 같은 키를 써서 서버가 중복 등록하지 않게 한다
  const submitAttemptRef = useRef<{ signature: string; idempotencyKey: string } | null>(null);

  // 사용자 유형은 초기값이 있으므로 이탈 확인 대상에 넣지 않는다. 공백만 입력한 내용은 빈 값
  const hasInput = content.length > 0;
  const canSubmit = userType !== null && content.trim().length > 0 && !submitSuggestion.isPending;

  const handleBackRef = useRef(() => {});
  const { releaseAndLeave } = useUnsavedBrowserBackGuard(hasInput, () => handleBackRef.current());

  const leavePage = useCallback(() => {
    releaseAndLeave(() => back());
  }, [back, releaseAndLeave]);

  const handleBack = useCallback(() => {
    if (isSubmittingRef.current) return;
    if (!hasInput) {
      leavePage();
      return;
    }

    openUnsavedExitDialog({
      title: '소중한 의견, 조금만 더 들려주세요.',
      description:
        '보내주신 아이디어는 똑독을 더 나은 서비스로 만드는 데 큰 도움이 돼요. 지금 나가면 작성한 내용이 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: leavePage,
    });
  }, [hasInput, leavePage]);

  useLayoutEffect(() => {
    handleBackRef.current = handleBack;
  }, [handleBack]);
  useNativeBackHandler(handleBack);

  const handleSubmit = async () => {
    if (!canSubmit || userType === null || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const payload = { userType, content: content.trim() };
    const signature = JSON.stringify(payload);
    const previous = submitAttemptRef.current;
    const idempotencyKey = previous?.signature === signature ? previous.idempotencyKey : crypto.randomUUID();
    submitAttemptRef.current = { signature, idempotencyKey };

    try {
      await submitSuggestion.mutateAsync({ idempotencyKey, body: payload });
      setIsLeaving(true);
      // 작성 화면으로 돌아가 다시 보내지 못하게 완료 화면으로 바꿔 연다 (PRD 7.6)
      releaseAndLeave(() => {
        replace({ pathname: route.mypage.ideaSuggestion.complete.root });
      });
    } catch {
      // 실패하면 화면과 사용자 유형·내용을 그대로 둔다
      toast(COMMON_ERROR_TOAST_MESSAGE);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>아이디어 제안</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {/* Figma 글자색은 #000000(neutral-1000)이라 text-primary(#15161b) 대신 primitive 토큰을 쓴다 */}
        <h2 className='h1-extrabold text-primitive-neutral-1000 p-x4 whitespace-pre-line'>
          {'고객님의\n소중한 의견을 들려주세요'}
        </h2>

        <SupportUserTypeField value={userType} onChange={setSelectedUserType} />

        <div className='px-x4 py-x3'>
          {/* 문의 작성과 같은 148px(테두리 포함)로 맞춘다. Figma는 100px (OQ-X14). textarea는 inline이라 아래 여백이 생기므로 block으로 둔다 */}
          <Textarea
            label='아이디어 내용'
            required
            variant='secondary'
            className='flex h-[148px] flex-col justify-between'
          >
            <TextareaInput
              placeholder='아이디어 내용을 작성해 주세요.'
              rows={3}
              value={content}
              maxLength={IDEA_CONTENT_MAX_LENGTH}
              onChange={(event) => setContent(event.target.value)}
              className='block h-auto'
            />
            <p className='body2-regular text-text-caption'>
              {content.length}/{IDEA_CONTENT_MAX_LENGTH}
            </p>
          </Textarea>
        </div>
      </div>

      <div className='bg-bg-0 p-x4 shrink-0'>
        <ActionButton type='button' size='large' disabled={!canSubmit} onClick={handleSubmit}>
          제안하기
        </ActionButton>
      </div>

      <ActionLoadingOverlay isPending={submitSuggestion.isPending || isLeaving} delayMs={ACTION_SPINNER_DELAY_MS} />
    </div>
  );
}

export { IdeaSuggestionWritePage };
