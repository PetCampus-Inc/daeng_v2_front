'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
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
  deleteOwnerNoticeTemplate,
  getOwnerNoticeTemplatesSnapshot,
  subscribeOwnerNoticeTemplates,
  type OwnerNoticeTemplate,
} from '@entities/owner-notice-template';
import { ownerDailyNoticeTemplateDetailContent } from '@views/owner-daily-notice-template-detail-page/config/ownerDailyNoticeTemplateDetailContent';
import { ownerDailyNoticeWriteContent } from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

interface FieldLabelProps {
  label: string;
}

const EMPTY_OWNER_NOTICE_TEMPLATES: OwnerNoticeTemplate[] = [];

function getServerSnapshot() {
  return EMPTY_OWNER_NOTICE_TEMPLATES;
}

function FieldLabel({ label }: FieldLabelProps) {
  return (
    <div className='body2-bold flex items-center gap-px'>
      <span className='text-text-primary'>{label}</span>
      <span className='text-text-accent'>*</span>
    </div>
  );
}

function useOwnerNoticeTemplate(templateId: string | undefined) {
  const templates = useSyncExternalStore(
    subscribeOwnerNoticeTemplates,
    getOwnerNoticeTemplatesSnapshot,
    getServerSnapshot
  );

  if (!templateId) return null;

  return templates.find((item) => item.id === templateId) ?? null;
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
  const template = useOwnerNoticeTemplate(templateId);
  const { back, push } = useStackNavigation();

  useEffect(() => {
    if (!isExpired) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={() => undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeWriteContent.expiredTitle}</AlertDialogTitle>
            <AlertDialogDescription className='whitespace-pre-line'>
              {ownerDailyNoticeWriteContent.expiredDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                close();
                back();
              }}
            >
              {ownerDailyNoticeWriteContent.expiredConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [back, isExpired]);

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
              onClick={() => {
                deleteOwnerNoticeTemplate(templateId);
                back();
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

  if (!template) {
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
