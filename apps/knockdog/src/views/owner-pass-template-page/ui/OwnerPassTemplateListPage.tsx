'use client';

import Image from 'next/image';

import { ActionButton, TicketListItem } from '@knockdog/ui';

import { ownerPassTemplateContent } from '@views/owner-pass-template-page/config/ownerPassTemplateContent';
import { Header } from '@widgets/Header';

import { formatPassTemplateSummary, useOwnerPassTemplatesQuery } from '@entities/owner-pass-template';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';

function OwnerPassTemplateListPage() {
  const { push } = useStackNavigation();
  const { data: templates, isLoading, isError, isFetching, refetch } = useOwnerPassTemplatesQuery();

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header className='h-[66px] shrink-0' innerClassName='h-[66px]'>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerPassTemplateContent.managementTitle}</Header.Title>
      </Header>

      {isLoading && !templates ? (
        <DelayedLoadingSpinner isLoading layout='content' />
      ) : isError ? (
        <PageError
          layout='inline'
          isRetrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : templates?.length ? (
        // Figma: 헤더 아래 간격 16 + 본문 위 여백 24 = 40, 항목 사이 12
        <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-10 pb-4'>
          <ul className='flex flex-col gap-3'>
            {templates.map((template) => (
              <li key={template.id}>
                <TicketListItem
                  title={<span className='block truncate'>{template.name}</span>}
                  description={formatPassTemplateSummary(template)}
                  onClick={() =>
                    push({
                      pathname: route.mypage.passTemplate.detail.root.replace('[id]', encodeURIComponent(template.id)),
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Figma: 헤더 아래 147px 지점에서 시작하는 고정 위치(가운데 정렬 아님)
        <div className='flex min-h-0 flex-1 flex-col items-center px-4 pt-[147px] text-center'>
          <div className='relative size-[200px] shrink-0'>
            <Image
              src={ownerPassTemplateContent.emptyImageSrc}
              alt=''
              width={200}
              height={136}
              className='absolute inset-x-0 top-[23.5%]'
              priority
            />
          </div>
          <p className='h2-extrabold text-text-primary mt-1'>{ownerPassTemplateContent.emptyTitle}</p>
          <p className='body1-regular text-fill-secondary-500 mt-1'>{ownerPassTemplateContent.emptyDescription}</p>
        </div>
      )}

      {!isError ? (
        <div className='bg-bg-0 shrink-0 px-4 pt-4 pb-[calc(1rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'>
          <ActionButton
            type='button'
            size='large'
            variant='primaryFill'
            onClick={() => push({ pathname: route.mypage.passTemplate.create.root })}
          >
            {ownerPassTemplateContent.createButtonLabel}
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

export { OwnerPassTemplateListPage };
