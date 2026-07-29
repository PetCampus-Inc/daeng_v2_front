'use client';

import { useParams, useSearchParams } from 'next/navigation';
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

import {
  useOwnerNoticeTemplateDetailQuery,
  useOwnerNoticeTemplateMutation,
} from '@entities/owner-notice-template';
import { useUserStore } from '@entities/user';
import { ownerDailyNoticeTemplateDetailContent } from '@views/owner-daily-notice-template-detail-page/config/ownerDailyNoticeTemplateDetailContent';
import { useExpiredNoticeDialog } from '@views/owner-daily-notice-write-page/lib/useExpiredNoticeDialog';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

interface FieldLabelProps {
  label: string;
}

function FieldLabel({ label }: FieldLabelProps) {
  return (
    <div className='body2-bold flex items-center gap-px'>
      <span className='text-text-primary'>{label}</span>
      <span className='text-text-accent'>*</span>
    </div>
  );
}

/**
 * 원장 일과 탭 — 알림장 템플릿 상세
 */
function OwnerDailyNoticeTemplateDetailPage() {
  const params = useParams<{ id: string; templateId: string }>();
  const searchParams = useSearchParams();
  const noticeId = params?.id;
  const templateId = params?.templateId;
  const isExpired = searchParams.get('expired') === 'true';
  const userId = useUserStore((state) => state.user?.userId);
  const { back, push } = useStackNavigation();
  const { deleteMutation } = useOwnerNoticeTemplateMutation();
  const { data: template, isLoading } = useOwnerNoticeTemplateDetailQuery({
    templateId,
    userId,
    enabled: Boolean(templateId) && !isExpired,
  });

  useExpiredNoticeDialog(isExpired, back);

  const handleDeleteClick = () => {
    if (isExpired) return;
    if (!templateId) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeTemplateDetailContent.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerDailyNoticeTemplateDetailContent.deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {ownerDailyNoticeTemplateDetailContent.deleteDialogCloseLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteMutation.mutateAsync(templateId);
                  close();
                  back();
                } catch {
                  toast({
                    nativeTitle: '템플릿을 삭제하지 못했어요',
                    title: (
                      <>
                        <span className='text-text-accent'>템플릿</span>
                        <span className='text-text-primary-inverse'>
                          을 삭제하지 못했어요. 다시 시도해 주세요
                        </span>
                      </>
                    ),
                  });
                }
              }}
            >
              {ownerDailyNoticeTemplateDetailContent.deleteDialogConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleEditClick = () => {
    if (isExpired) return;
    if (!noticeId || !templateId) return;

    push({
      pathname: route.owner.daily.notice.template.create.root.replace('[id]', noticeId),
      query: { templateId },
    });
  };

  if (isLoading || !template) {
    return (
      <div className='bg-bg-50 flex h-dvh flex-col'>
        <div className='bg-bg-50 pt-(--safe-area-inset-top,0px)'>
          <Header className='bg-bg-50'>
            <Header.LeftSection>
              <Header.BackButton />
            </Header.LeftSection>
            <Header.Title>{ownerDailyNoticeTemplateDetailContent.pageTitle}</Header.Title>
          </Header>
        </div>
        <div className='flex flex-1 items-center justify-center px-4'>
          <p className='body1-regular text-text-secondary'>
            {isLoading ? '템플릿을 불러오는 중이에요' : '템플릿을 찾을 수 없어요'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-50 pt-(--safe-area-inset-top,0px)'>
        <Header className='bg-bg-50'>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>{ownerDailyNoticeTemplateDetailContent.pageTitle}</Header.Title>
        </Header>
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4'>
        <section className='flex shrink-0 flex-col gap-2 py-2'>
          <FieldLabel label={ownerDailyNoticeTemplateDetailContent.titleSectionLabel} />
          <div className='bg-fill-secondary-50 border-line-200 radius-r2 flex items-center border px-4 py-[14px]'>
            <p className='body1-regular text-text-secondary'>{template.title}</p>
          </div>
        </section>

        <section className='flex min-h-0 flex-1 flex-col py-3'>
          <div className='bg-fill-secondary-50 border-line-200 radius-r2 flex min-h-0 flex-1 flex-col border px-4 py-3'>
            <p className='body1-regular text-text-tertiary whitespace-pre-wrap'>{template.content}</p>
          </div>
        </section>

        <SafeArea edges={['bottom']} className='bg-bg-50 shrink-0'>
          <div className='flex gap-2 py-5'>
            <ActionButton
              type='button'
              variant='secondaryLine'
              size='large'
              className='flex-1'
              onClick={handleDeleteClick}
              disabled={deleteMutation.isPending}
            >
              {ownerDailyNoticeTemplateDetailContent.deleteButtonLabel}
            </ActionButton>
            <ActionButton
              type='button'
              variant='secondaryFill'
              size='large'
              className='flex-1'
              onClick={handleEditClick}
            >
              {ownerDailyNoticeTemplateDetailContent.editButtonLabel}
            </ActionButton>
          </div>
        </SafeArea>
      </div>
    </div>
  );
}

export { OwnerDailyNoticeTemplateDetailPage };
