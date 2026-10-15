'use client';

import { useCallback, useRef, useState } from 'react';

import { ActionButton, IconButton, Textarea, TextareaInput, TextField, TextFieldInput } from '@knockdog/ui';
import { canSubmitInquiry, hasInquiryWriteInput } from '@views/inquiry-write-page/lib/inquiryWriteForm';
import { Header } from '@widgets/Header';
import { InquiryPhotoField, useInquiryPhotos } from '@features/inquiry-photo';
import { useMypageRoleView, useOwnerRole } from '@features/role-conversion';
import { SupportUserTypeField } from '@features/support';
import {
  INQUIRY_BODY_MAX_LENGTH,
  INQUIRY_TITLE_MAX_LENGTH,
  inquiriesQueryKeys,
  useCreateInquiryMutation,
  type InquiryUserType,
} from '@entities/inquiry';
import { useUserStore } from '@entities/user';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

/** 1:1 문의 작성. 등록에 성공하면 문의 내역 목록으로 돌아가 `문의를 접수했어요` 토스트를 띄운다 (PRD 차이 C-9) */
function InquiryWritePage() {
  const { back } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const createInquiry = useCreateInquiryMutation({ userId });
  const { photos, uploadingCount, isUploading, canAddPhoto, addPhotos, removePhoto } = useInquiryPhotos();

  // 사용자 유형 초기값: 진입한 마이페이지의 현재 모드. 모드를 확인하기 전에는 미선택으로 둔다
  const { isResolved: isOwnerRoleResolved } = useOwnerRole();
  const { isOwnerView } = useMypageRoleView();
  const [selectedUserType, setSelectedUserType] = useState<InquiryUserType | null | undefined>(undefined);
  const initialUserType: InquiryUserType | null = isOwnerRoleResolved ? (isOwnerView ? 'OWNER' : 'GUARDIAN') : null;
  const userType = selectedUserType === undefined ? initialUserType : selectedUserType;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const isSubmittingRef = useRef(false);
  // 같은 내용을 다시 보내면 같은 키를 써서 서버가 중복 등록하지 않게 한다
  const createAttemptRef = useRef<{ signature: string; idempotencyKey: string } | null>(null);

  const formValues = { userType, title, body, photoCount: photos.length };
  const hasInput = hasInquiryWriteInput(formValues);
  const canSubmit = canSubmitInquiry(formValues) && !isUploading && !createInquiry.isPending;

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

  const handleSubmit = async () => {
    if (!canSubmit || userType === null || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const payload = {
      userType,
      title: title.trim(),
      body: body.trim(),
      images: photos.map(({ tempKey, originalFilename }) => ({ tempKey, originalFilename })),
    };
    const signature = JSON.stringify(payload);
    const previous = createAttemptRef.current;
    const idempotencyKey = previous?.signature === signature ? previous.idempotencyKey : crypto.randomUUID();
    createAttemptRef.current = { signature, idempotencyKey };

    try {
      await createInquiry.mutateAsync({ idempotencyKey, body: payload });
      // 앱에서는 목록이 다른 웹뷰라 그쪽 캐시도 다시 불러오게 알린다
      // userId가 있을 때만 보내므로 키에 undefined가 들어가지 않는다
      if (userId) syncWebViewQuery.invalidate(inquiriesQueryKeys.byUser(userId) as readonly string[]);
      releaseAndLeave(() => {
        back();
        toast('문의를 접수했어요');
      });
    } catch {
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
        <Header.Title>문의 작성</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <SupportUserTypeField value={userType} onChange={setSelectedUserType} />

        <div className='px-x4 py-x3'>
          {/* Figma 입력창 48px. input은 줄 높이 대신 글꼴 높이로 계산돼 46px이 되므로 높이를 고정한다 */}
          <TextField
            label='문의 제목'
            required
            className='h-x12'
            suffix={title ? <IconButton icon='DeleteInput' aria-label='제목 지우기' onClick={() => setTitle('')} /> : undefined}
          >
            <TextFieldInput
              placeholder='문의 제목을 입력해 주세요.'
              value={title}
              maxLength={INQUIRY_TITLE_MAX_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
            />
          </TextField>
        </div>

        <div className='px-x4 py-x3'>
          {/* Figma 입력창 148px(테두리 포함). textarea는 inline이라 아래 여백이 생기므로 block으로 두고 높이를 고정한다 */}
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

      <ActionLoadingOverlay isPending={createInquiry.isPending} />
    </div>
  );
}

export { InquiryWritePage };
