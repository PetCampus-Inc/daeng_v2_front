'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Icon,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';

import {
  useOwnerNoticeTemplateDetailQuery,
  useOwnerNoticeTemplateMutation,
} from '@entities/owner-notice-template';
import { useUserStore } from '@entities/user';
import { ownerDailyNoticeTemplateCreateContent } from '@views/owner-daily-notice-template-create-page/config/ownerDailyNoticeTemplateCreateContent';
import { TemplateContentTextarea } from '@views/owner-daily-notice-template-create-page/ui/TemplateContentTextarea';
import { useExpiredNoticeDialog } from '@views/owner-daily-notice-write-page/lib/useExpiredNoticeDialog';

import { Header } from '@widgets/Header';

import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

interface FieldLabelProps {
  label: string;
}

interface TemplateCreateFormState {
  title: string;
  content: string;
  initialTitle: string;
  initialContent: string;
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
 * 원장 일과 탭 — 알림장 템플릿 생성/수정
 */
function OwnerDailyNoticeTemplateCreatePage() {
  const searchParams = useSearchParams();
  const editingTemplateId = searchParams.get('templateId');
  const isExpired = searchParams.get('expired') === 'true';
  const { back } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { createMutation, updateMutation } = useOwnerNoticeTemplateMutation();
  const { data: editingTemplate } = useOwnerNoticeTemplateDetailQuery({
    templateId: editingTemplateId ?? undefined,
    userId,
    enabled: Boolean(editingTemplateId) && !isExpired,
  });
  const [formState, setFormState] = useState<TemplateCreateFormState>({
    title: '',
    content: '',
    initialTitle: '',
    initialContent: '',
  });

  const { title, content, initialTitle, initialContent } = formState;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useExpiredNoticeDialog(isExpired, back);

  useEffect(() => {
    if (isExpired || !editingTemplateId || !editingTemplate) return;

    const nextTitle = editingTemplate.title;
    const nextContent = editingTemplate.content;

    const timerId = window.setTimeout(() => {
      setFormState({
        title: nextTitle,
        content: nextContent,
        initialTitle: nextTitle,
        initialContent: nextContent,
      });
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [editingTemplate, editingTemplateId, isExpired]);

  const hasTitle = title.trim().length > 0;
  const hasContent = content.trim().length > 0;
  const isSaveEnabled = hasTitle && !isSaving;
  const hasDraft = title !== initialTitle || content !== initialContent;

  const handleBackClick = () => {
    if (isExpired) return;
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

  const handleSaveClick = async () => {
    if (isExpired) return;
    if (!isSaveEnabled) return;
    if (!hasContent) {
      toast({
        nativeTitle: '본문을 작성해 주세요',
        title: (
          <div className='flex items-center gap-1'>
            <Icon icon='InfoLine' className='text-text-accent size-5 shrink-0' />
            <span className='text-text-primary-inverse'>본문을 작성해 주세요</span>
          </div>
        ),
      });
      return;
    }

    const input = {
      title: title.trim(),
      content: content.trim(),
    };

    try {
      if (editingTemplateId) {
        await updateMutation.mutateAsync({ templateId: editingTemplateId, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      back();
    } catch {
      toast({
        nativeTitle: '템플릿을 저장하지 못했어요',
        title: (
          <>
            <span className='text-text-accent'>템플릿</span>
            <span className='text-text-primary-inverse'>을 저장하지 못했어요. 다시 시도해 주세요</span>
          </>
        ),
      });
    }
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
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
            />
          </TextField>
        </section>

        <section className='flex min-h-0 flex-1 flex-col pb-4 [&>div]:min-h-0 [&>div]:flex-1 [&>div]:h-full'>
          <TemplateContentTextarea
            value={content}
            maxLength={ownerDailyNoticeTemplateCreateContent.contentMaxLength}
            placeholder={ownerDailyNoticeTemplateCreateContent.contentPlaceholder}
            onChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                content: value,
              }))
            }
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
