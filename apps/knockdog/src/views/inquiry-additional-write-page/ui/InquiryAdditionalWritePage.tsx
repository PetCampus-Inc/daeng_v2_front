'use client';

import { useCallback, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { ActionButton, Textarea, TextareaInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { InquiryPhotoField, useInquiryPhotos } from '@features/inquiry-photo';
import {
  INQUIRY_BODY_MAX_LENGTH,
  INQUIRY_ERROR_CODE,
  inquiriesQueryKeys,
  inquiryDetailQueryKey,
  parseInquiryId,
  useAdditionalInquiryMutation,
} from '@entities/inquiry';
import { useUserStore } from '@entities/user';
import { ApiError } from '@shared/api';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

/** 추가 문의 작성. 기존 문의 스레드에 이어서 등록하고, 성공하면 문의 상세로 돌아간다 (PRD 7.4) */
function InquiryAdditionalWritePage() {
  const params = useParams<{ id: string }>();
  const inquiryId = parseInquiryId(params.id);
  const { back } = useStackNavigation();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const addInquiry = useAdditionalInquiryMutation({ userId });
  const { photos, uploadingCount, isUploading, canAddPhoto, addPhotos, removePhoto } = useInquiryPhotos();

  const [body, setBody] = useState('');
  const isSubmittingRef = useRef(false);
  // 같은 내용을 다시 보내면 같은 키를 써서 서버가 중복 등록하지 않게 한다
  const submitAttemptRef = useRef<{ signature: string; idempotencyKey: string } | null>(null);

  // 사진은 선택이라 활성 조건에 넣지 않는다. 공백만 입력한 내용은 빈 값
  const hasInput = body.length > 0 || photos.length > 0;
  const canSubmit = inquiryId !== null && body.trim().length > 0 && !isUploading && !addInquiry.isPending;

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
      title: '저장하지 않고 나갈까요?',
      description: '변경한 내용이 저장되지 않아요.',
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: leavePage,
    });
  }, [hasInput, leavePage]);

  handleBackRef.current = handleBack;
  useNativeBackHandler(handleBack);

  /** 앱에서는 상세·목록이 다른 웹뷰라 그쪽 캐시도 다시 불러오게 알린다 */
  const notifyOtherWebViews = () => {
    if (!userId) return;
    syncWebViewQuery.invalidate(inquiriesQueryKeys.byUser(userId) as readonly string[]);
    syncWebViewQuery.invalidate(inquiryDetailQueryKey(userId, inquiryId) as readonly (string | number)[]);
  };

  const handleSubmit = async () => {
    if (!canSubmit || inquiryId === null || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const payload = {
      body: body.trim(),
      images: photos.map(({ tempKey, originalFilename }) => ({ tempKey, originalFilename })),
    };
    const signature = JSON.stringify(payload);
    const previous = submitAttemptRef.current;
    const idempotencyKey = previous?.signature === signature ? previous.idempotencyKey : crypto.randomUUID();
    submitAttemptRef.current = { signature, idempotencyKey };

    try {
      await addInquiry.mutateAsync({ inquiryId, idempotencyKey, body: payload });
      notifyOtherWebViews();
      releaseAndLeave(() => back());
    } catch (error) {
      // 다른 기기에서 이미 종료한 문의면 상세로 돌아가 해결 완료 상태를 보여준다 (OQ-X11)
      if (error instanceof ApiError && error.code === INQUIRY_ERROR_CODE.ALREADY_RESOLVED) {
        await queryClient.invalidateQueries({ queryKey: inquiryDetailQueryKey(userId, inquiryId) });
        notifyOtherWebViews();
        releaseAndLeave(() => back());
        return;
      }
      // 실패하면 화면과 입력값·사진을 그대로 둔다
      toast(COMMON_ERROR_TOAST_MESSAGE);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>추가 문의 작성</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='px-x4 py-x3'>
          {/* 문의 작성과 같은 입력창. Figma 148px(테두리 포함), textarea는 inline이라 아래 여백이 생기므로 block으로 둔다 */}
          <Textarea label='문의 내용' required variant='secondary' className='flex h-[148px] flex-col justify-between'>
            <TextareaInput
              placeholder='문의할 내용을 작성해 주세요.'
              rows={3}
              value={body}
              maxLength={INQUIRY_BODY_MAX_LENGTH}
              onChange={(event) => setBody(event.target.value)}
              className='block h-auto'
            />
            <p className='body2-regular text-text-caption'>
              {body.length}/{INQUIRY_BODY_MAX_LENGTH}
            </p>
          </Textarea>
        </div>

        {/* Figma에는 없지만 PRD OQ-P3에서 추가 문의도 사진 등록을 제공하기로 했다 */}
        <InquiryPhotoField
          photos={photos}
          uploadingCount={uploadingCount}
          canAddPhoto={canAddPhoto}
          onAdd={addPhotos}
          onRemove={removePhoto}
        />
      </div>

      <div className='bg-bg-0 p-x4 shrink-0'>
        <ActionButton type='button' size='large' disabled={!canSubmit} onClick={handleSubmit}>
          등록하기
        </ActionButton>
      </div>

      <ActionLoadingOverlay isPending={addInquiry.isPending} />
    </div>
  );
}

export { InquiryAdditionalWritePage };
