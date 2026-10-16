'use client';

import { useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';

import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { InquiryMessageItem } from '@views/inquiry-detail-page/ui/InquiryMessageItem';
import { InquiryUserTypeBadge } from '@views/inquiry-detail-page/ui/InquiryUserTypeBadge';
import { Header } from '@widgets/Header';

import {
  INQUIRY_ERROR_CODE,
  InquiryStatusBadge,
  inquiriesQueryKeys,
  parseInquiryId,
  useInquiryDetailQuery,
  useResolveInquiryMutation,
} from '@entities/inquiry';
import { useUserStore } from '@entities/user';
import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { openConfirmDialog, useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { ActionLoadingOverlay, ACTION_SPINNER_DELAY_MS, DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

const RESOLVE_DIALOG = {
  title: '문의를 종료할까요?',
  description: '종료하면 이 문의에 이어서 추가 문의를 남길 수 없어요.',
  cancelLabel: '닫기',
  confirmLabel: '종료하기',
};

/** 문의 상세. 사용자 문의와 운영자 답변을 시간순으로 보여주고, 해결 완료 전에는 추가 문의·종료 버튼을 둔다 */
function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const inquiryId = parseInquiryId(params.id);
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const query = useInquiryDetailQuery({ userId, inquiryId });
  const resolveInquiry = useResolveInquiryMutation({ userId });
  const isResolvingRef = useRef(false);

  const inquiry = query.data;
  // 경로의 id가 잘못되면 요청 자체를 하지 않으므로 조회 실패로 보여준다
  const isError = inquiryId === null || query.isError;
  const isPending = !userId || query.isPending;
  const messages = inquiry
    ? [...inquiry.messages].sort(
        (first, second) => first.createdAt.localeCompare(second.createdAt) || first.id - second.id
      )
    : [];

  // 알림에서 바로 들어와 이전 화면이 없으면 홈으로 보낸다 (PRD 7.2)
  const handleBack = useCallback(async () => {
    try {
      if (await back()) return;
    } catch {
      // 이전 화면으로 가지 못한 경우와 같이 홈으로 보낸다
    }
    await navigateToTab('/');
  }, [back, navigateToTab]);

  useNativeBackHandler(handleBack);

  const resolve = async () => {
    if (inquiryId === null || isResolvingRef.current) return;
    isResolvingRef.current = true;

    try {
      await resolveInquiry.mutateAsync(inquiryId);
      // 앱에서는 목록이 다른 웹뷰라 그쪽 캐시도 다시 불러오게 알린다
      if (userId) syncWebViewQuery.invalidate(inquiriesQueryKeys.byUser(userId) as readonly string[]);
    } catch (error) {
      // 다른 기기에서 이미 종료한 문의면 최신 상태(해결 완료)로 다시 불러온다
      if (error instanceof ApiError && error.code === INQUIRY_ERROR_CODE.ALREADY_RESOLVED) {
        await query.refetch();
        return;
      }
      toast(COMMON_ERROR_TOAST_MESSAGE);
    } finally {
      isResolvingRef.current = false;
    }
  };

  const openWebResolveDialog = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        {/* Figma 1:2866: 폭 358px, 글자 좌우 여백 36px, 버튼 좌우 여백 32px (공통 기본값은 334px·20px). 좁은 화면에서는 좌우 16px를 남긴다 */}
        <AlertDialogContent className='max-w-[min(358px,calc(100%-32px))]'>
          <AlertDialogHeader className='px-x9'>
            <AlertDialogTitle>{RESOLVE_DIALOG.title}</AlertDialogTitle>
            <AlertDialogDescription>{RESOLVE_DIALOG.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='px-x8'>
            <AlertDialogCancel>{RESOLVE_DIALOG.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                resolve();
              }}
            >
              {RESOLVE_DIALOG.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleResolveClick = async () => {
    const result = await openConfirmDialog(RESOLVE_DIALOG);
    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') await resolve();
      return;
    }

    openWebResolveDialog();
  };

  const handleAdditionalInquiryClick = () => {
    if (inquiryId === null) return;
    push({ pathname: route.mypage.inquiry.detail.write.root.replace('[id]', String(inquiryId)) });
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>문의 상세</Header.Title>
      </Header>

      {isError ? (
        <PageError layout='inline' isRetrying={query.isFetching} onRetry={() => query.refetch()} />
      ) : isPending || !inquiry ? (
        <DelayedLoadingSpinner isLoading layout='content' />
      ) : (
        <>
          <div className='min-h-0 flex-1 overflow-y-auto'>
            <div className='gap-x3 px-x4 pt-x4 pb-x2 flex flex-col'>
              <div className='gap-x1 flex items-center'>
                <InquiryStatusBadge status={inquiry.status} />
                <InquiryUserTypeBadge userType={inquiry.userType} />
              </div>
              <h2 className='h2-semibold text-text-primary break-words'>{inquiry.title}</h2>
            </div>

            {messages.map((message) => (
              <InquiryMessageItem key={message.id} message={message} />
            ))}
          </div>

          {/* 해결 완료는 조회 전용이라 문구와 버튼을 숨긴다 */}
          {inquiry.status !== 'RESOLVED' ? (
            <div className='bg-bg-0 shrink-0'>
              <p className='body1-bold text-text-primary px-x4 pt-x4 text-center'>궁금한 점이 해결되었나요?</p>
              <div className='gap-x2 p-x4 flex'>
                <ActionButton type='button' variant='secondaryLine' size='large' onClick={handleAdditionalInquiryClick}>
                  추가 문의하기
                </ActionButton>
                <ActionButton
                  type='button'
                  variant='primaryLine'
                  size='large'
                  disabled={resolveInquiry.isPending}
                  onClick={handleResolveClick}
                >
                  해결됐어요
                </ActionButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      <ActionLoadingOverlay isPending={resolveInquiry.isPending} delayMs={ACTION_SPINNER_DELAY_MS} />
    </div>
  );
}

export { InquiryDetailPage };
