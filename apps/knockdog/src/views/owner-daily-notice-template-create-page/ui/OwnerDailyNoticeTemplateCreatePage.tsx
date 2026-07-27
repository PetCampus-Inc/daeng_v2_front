'use client';

import { useState } from 'react';

import { ActionButton, TextField, TextFieldInput } from '@knockdog/ui';

import { ownerDailyNoticeTemplateCreateContent } from '@views/owner-daily-notice-template-create-page/config/ownerDailyNoticeTemplateCreateContent';

import { Header } from '@widgets/Header';

import { SafeArea } from '@shared/ui/safe-area';

import { TemplateContentTextarea } from './TemplateContentTextarea';

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
 * 원장 일과 탭 — 알림장 템플릿 생성
 */
function OwnerDailyNoticeTemplateCreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isCreateEnabled = title.trim().length > 0 && content.trim().length > 0;

  const handleCreateClick = () => {
    if (!isCreateEnabled) return;

    // @todo 템플릿 생성 API 연동
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-50 pt-(--safe-area-inset-top,0px)'>
        <Header className='bg-bg-50'>
          <Header.LeftSection>
            <Header.BackButton />
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
              disabled={!isCreateEnabled}
              onClick={handleCreateClick}
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
