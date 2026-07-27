'use client';

import { ActionButton, Icon } from '@knockdog/ui';

import {
  NOTICE_TEMPLATE_MOCK_COUNT,
  ownerDailyNoticeTemplateContent,
} from '@views/owner-daily-notice-template-page/config/ownerDailyNoticeTemplateContent';

import { Header } from '@widgets/Header';

import { SafeArea } from '@shared/ui/safe-area';

/**
 * 원장 일과 탭 — 알림장 템플릿 목록 (빈 상태)
 */
function OwnerDailyNoticeTemplatePage() {
  const templateCount = NOTICE_TEMPLATE_MOCK_COUNT;
  const hasTemplates = templateCount > 0;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-50 pt-(--safe-area-inset-top,0px)'>
        <Header className='bg-bg-50'>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>{ownerDailyNoticeTemplateContent.pageTitle}</Header.Title>
        </Header>
      </div>

      <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-4'>
        <div className='flex w-full flex-col items-center gap-1 text-center'>
          <p className='h2-extrabold text-text-primary'>{ownerDailyNoticeTemplateContent.emptyTitle}</p>
          <p className='body1-regular text-text-primary whitespace-pre-line'>
            {ownerDailyNoticeTemplateContent.emptyDescription}
          </p>
        </div>
      </div>

      <SafeArea edges={['bottom']} className='bg-bg-50 shrink-0'>
        <div className='flex gap-2 px-4 py-5'>
          <ActionButton type='button' variant='secondaryLine' size='large' className='flex-1'>
            <Icon icon='Plus' className='size-5' />
            {ownerDailyNoticeTemplateContent.createTemplateLabel}
          </ActionButton>
          <ActionButton
            type='button'
            variant='tertiaryFill'
            size='large'
            className='flex-1'
            disabled={!hasTemplates}
          >
            {ownerDailyNoticeTemplateContent.loadTemplateLabel}
            {hasTemplates ? ` ${templateCount}개` : null}
          </ActionButton>
        </div>
      </SafeArea>
    </div>
  );
}

export { OwnerDailyNoticeTemplatePage };
