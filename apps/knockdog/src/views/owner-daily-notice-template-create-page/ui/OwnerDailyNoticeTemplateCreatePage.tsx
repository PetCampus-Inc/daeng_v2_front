'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

import {
  addOwnerNoticeTemplate,
  getOwnerNoticeTemplatesSnapshot,
  updateOwnerNoticeTemplate,
} from '@entities/owner-notice-template';
import { ownerDailyNoticeTemplateCreateContent } from '@views/owner-daily-notice-template-create-page/config/ownerDailyNoticeTemplateCreateContent';
import { TemplateContentTextarea } from '@views/owner-daily-notice-template-create-page/ui/TemplateContentTextarea';

import { Header } from '@widgets/Header';

import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

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

function getEditingTemplate(editingTemplateId: string | null) {
  if (!editingTemplateId) return null;

  return (
    getOwnerNoticeTemplatesSnapshot().find((item) => item.id === editingTemplateId) ?? null
  );
}

/**
 * 원장 일과 탭 — 알림장 템플릿 생성/수정
 */
function OwnerDailyNoticeTemplateCreatePage() {
  const searchParams = useSearchParams();
  const editingTemplateId = searchParams.get('templateId');
  const editingTemplate = getEditingTemplate(editingTemplateId);
  const { back } = useStackNavigation();
  const [title, setTitle] = useState(() => editingTemplate?.title ?? '');
  const [content, setContent] = useState(() => editingTemplate?.content ?? '');

  const isSaveEnabled = title.trim().length > 0 && content.trim().length > 0;
  const hasDraft = title.trim().length > 0 || content.trim().length > 0;

  const handleBackClick = () => {
    if (!hasDraft) {
      back();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장하지 않고 나갈까요?</AlertDialogTitle>
            <AlertDialogDescription>
              지금 나가면 현재까지 쓴 내용이 사라져요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={() => back()}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleSaveClick = () => {
    if (!isSaveEnabled) return;

    const input = {
      title: title.trim(),
      content: content.trim(),
    };

    if (editingTemplateId) {
      updateOwnerNoticeTemplate(editingTemplateId, input);
    } else {
      addOwnerNoticeTemplate(input);
    }

    back();
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-50 pt-(--safe-area-inset-top,0px)'>
        <Header className='bg-bg-50'>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBackClick} />
          </Header.LeftSection>
          <Header.Title>{ownerDailyNoticeTemplateCreateContent.pageTitle}</Header.Title>
        </Header>
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4'>
        <section className='flex shrink-0 flex-col gap-2 py-4'>
          <FieldLabel label={ownerDailyNoticeTemplateCreateContent.titleSectionLabel} />
          <TextField variant='default' className='h-x13 focus-within:!border-line-200'>
            <TextFieldInput
              value={title}
              maxLength={ownerDailyNoticeTemplateCreateContent.titleMaxLength}
              placeholder={ownerDailyNoticeTemplateCreateContent.titlePlaceholder}
              onChange={(event) => setTitle(event.target.value)}
            />
          </TextField>
        </section>

        <section className='flex min-h-0 flex-1 flex-col pb-4 [&>div]:min-h-0 [&>div]:flex-1 [&>div]:h-full'>
          <TemplateContentTextarea
            value={content}
            maxLength={ownerDailyNoticeTemplateCreateContent.contentMaxLength}
            placeholder={ownerDailyNoticeTemplateCreateContent.contentPlaceholder}
            onChange={setContent}
          />
        </section>

        <SafeArea edges={['bottom']} className='bg-bg-50 shrink-0'>
          <div className='py-5'>
            <ActionButton
              type='button'
              variant='secondaryFill'
              size='large'
              className='w-full'
              disabled={!isSaveEnabled}
              onClick={handleSaveClick}
            >
              {ownerDailyNoticeTemplateCreateContent.createButtonLabel}
            </ActionButton>
          </div>
        </SafeArea>
      </div>
    </div>
  );
}

export { OwnerDailyNoticeTemplateCreatePage };
