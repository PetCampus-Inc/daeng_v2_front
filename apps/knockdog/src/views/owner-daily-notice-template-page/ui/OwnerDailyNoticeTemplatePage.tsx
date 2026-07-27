'use client';

import { useParams } from 'next/navigation';

import { ActionButton, Icon, RadioGroup } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { useOwnerNoticeTemplates } from '@entities/owner-notice-template';
import { ownerDailyNoticeTemplateContent } from '@views/owner-daily-notice-template-page/config/ownerDailyNoticeTemplateContent';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

import { OwnerNoticeTemplateRadioCard } from './OwnerNoticeTemplateRadioCard';

/**
 * 원장 일과 탭 — 알림장 템플릿 목록
 */
function OwnerDailyNoticeTemplatePage() {
  const params = useParams<{ id: string }>();
  const noticeId = params?.id;
  const { push } = useStackNavigation();
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    hasTemplates,
  } = useOwnerNoticeTemplates();

  const hasSelection = Boolean(selectedTemplateId);
  const isLoadTemplateEnabled = hasTemplates && hasSelection;

  const handleCreateTemplateClick = () => {
    if (!noticeId) return;

    push({
      pathname: route.owner.daily.notice.template.create.root.replace('[id]', noticeId),
    });
  };

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

      {hasTemplates ? (
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4'>
          <RadioGroup
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
            className='gap-4'
          >
            {templates.map((template) => (
              <OwnerNoticeTemplateRadioCard key={template.id} template={template} />
            ))}
          </RadioGroup>
        </div>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-4'>
          <div className='flex w-full flex-col items-center gap-1 text-center'>
            <p className='h2-extrabold text-text-primary'>
              {ownerDailyNoticeTemplateContent.emptyTitle}
            </p>
            <p className='body1-regular text-text-primary whitespace-pre-line'>
              {ownerDailyNoticeTemplateContent.emptyDescription}
            </p>
          </div>
        </div>
      )}

      <SafeArea edges={['bottom']} className='bg-bg-50 shrink-0'>
        <div className='flex gap-2 px-4 py-5'>
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='large'
            className='flex-1'
            onClick={handleCreateTemplateClick}
          >
            <Icon icon='Plus' className='size-5' />
            {ownerDailyNoticeTemplateContent.createTemplateLabel}
          </ActionButton>
          <ActionButton
            type='button'
            variant={isLoadTemplateEnabled ? 'secondaryFill' : 'tertiaryFill'}
            size='large'
            className={cn(
              'flex-1',
              hasTemplates &&
                !hasSelection &&
                'disabled:!text-text-secondary-inverse data-[disabled]:!text-text-secondary-inverse'
            )}
            disabled={!isLoadTemplateEnabled}
          >
            {ownerDailyNoticeTemplateContent.loadTemplateLabel}
          </ActionButton>
        </div>
      </SafeArea>
    </div>
  );
}

export { OwnerDailyNoticeTemplatePage };
