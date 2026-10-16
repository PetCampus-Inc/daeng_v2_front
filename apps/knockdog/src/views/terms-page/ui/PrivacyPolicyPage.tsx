'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Icon } from '@knockdog/ui';
import { Header } from '@widgets/Header';

import {
  formatPlatformDate,
  PlatformRichContent,
  useLegalDocumentDetailQuery,
  useLegalDocumentVersionsQuery,
  type LegalDocumentType,
} from '@entities/platform-content';

function TermVersionBadge({ label }: { label: '현행' | '예정' }) {
  return (
    <span
      className={`caption1-semibold radius-full flex h-5 min-w-[37px] shrink-0 items-center justify-center px-2 leading-[18px] ${label === '현행' ? 'bg-info-light text-info' : 'bg-bg-50 text-primitive-neutral-500'}`}
    >
      {label}
    </span>
  );
}

function TermsDetailPage({ title, type }: { title: string; type: LegalDocumentType }) {
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const versionsQuery = useLegalDocumentVersionsQuery(type);
  const currentVersion = versionsQuery.data?.find((version) => version.displayStatus === 'CURRENT');
  const rawQueryVersionId = searchParams.get('versionId');
  const queryVersionId = rawQueryVersionId ? Number(rawQueryVersionId) : Number.NaN;
  const selectedVersion = Number.isSafeInteger(queryVersionId)
    ? versionsQuery.data?.find((version) => version.id === queryVersionId)
    : undefined;
  const selectedVersionId = selectedVersion?.id;
  const detailQuery = useLegalDocumentDetailQuery(
    type,
    selectedVersionId,
    currentVersion != null || selectedVersionId != null
  );
  const displayedVersion = selectedVersion ?? currentVersion;

  const selectVersion = (versionId: number | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (versionId == null) params.delete('versionId');
    else params.set('versionId', String(versionId));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (!isVersionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !versionMenuRef.current?.contains(event.target)) {
        setIsVersionMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVersionMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVersionMenuOpen]);

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0 border-b-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>{title}</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto px-4'>
        {versionsQuery.data && versionsQuery.data.length > 0 && (
          <div ref={versionMenuRef} className='relative mt-2 mb-2'>
            <button
              type='button'
              className='border-line-200 radius-r2 flex h-10 w-full items-center justify-between border px-4'
              aria-expanded={isVersionMenuOpen}
              aria-controls='legal-document-versions'
              onClick={() => setIsVersionMenuOpen((open) => !open)}
            >
              <span className='flex items-center gap-1'>
                <span className='body2-regular text-text-primary'>
                  {displayedVersion ? `${formatPlatformDate(displayedVersion.effectiveAt)} 시행` : '시행 중인 버전 없음'}
                </span>
                {displayedVersion?.displayStatus === 'CURRENT' && <TermVersionBadge label='현행' />}
                {displayedVersion?.displayStatus === 'UPCOMING' && <TermVersionBadge label='예정' />}
              </span>
              <Icon
                icon={isVersionMenuOpen ? 'ChevronTop' : 'ChevronBottom'}
                className='text-text-tertiary size-5'
                aria-hidden='true'
              />
            </button>
            {isVersionMenuOpen && (
              <div
                id='legal-document-versions'
                className='border-line-200 bg-bg-0 radius-r2 absolute top-full left-0 z-20 flex max-h-[168px] w-[175px] flex-col overflow-y-auto border px-0 py-3'
              >
                {versionsQuery.data.map((version) => {
                  const isCurrent = version.displayStatus === 'CURRENT';
                  const isUpcoming = version.displayStatus === 'UPCOMING';
                  const isSelected = selectedVersionId == null ? isCurrent : version.id === selectedVersionId;
                  const label = isCurrent ? '현행' : isUpcoming ? '예정' : null;

                  return (
                    <button
                      key={version.id}
                      type='button'
                      aria-pressed={isSelected}
                      className='group relative flex h-9 w-full shrink-0 items-center px-3 py-2 text-left'
                      onClick={() => {
                        selectVersion(isCurrent ? undefined : version.id);
                        setIsVersionMenuOpen(false);
                      }}
                    >
                      <span
                        aria-hidden='true'
                        className='radius-r2 pointer-events-none absolute inset-0 group-hover:bg-bg-50'
                      />
                      <span
                        className={`relative z-10 flex h-5 w-[151px] items-center gap-1 ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}
                      >
                        <span
                          className='body2-regular w-[110px] shrink-0 whitespace-nowrap text-center align-middle'
                          style={{ letterSpacing: '-0.006em' }}
                        >
                          {formatPlatformDate(version.effectiveAt)} 시행
                        </span>
                        {label && <TermVersionBadge label={label} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {versionsQuery.isError ? (
          <p className='body1-regular text-text-secondary py-8 text-center'>약관 버전을 불러오지 못했어요.</p>
        ) : versionsQuery.isPending || (currentVersion && detailQuery.isPending) || (selectedVersionId && detailQuery.isPending) ? (
          <p className='body1-regular text-text-secondary py-8 text-center'>약관을 불러오고 있어요.</p>
        ) : detailQuery.isError ? (
          <p className='body1-regular text-text-secondary py-8 text-center'>약관을 불러오지 못했어요.</p>
        ) : detailQuery.data ? (
          <article className='body2-regular text-text-primary flex flex-col gap-5 py-5'>
            <h1 className='body2-bold'>{detailQuery.data.title || title}</h1>
            <PlatformRichContent
              value={detailQuery.data.body}
              typography='body2'
              style={{ letterSpacing: '-0.006em' }}
            />
          </article>
        ) : (
          <p className='body1-regular text-text-secondary py-8 text-center'>등록된 약관이 없어요.</p>
        )}
      </main>
    </div>
  );
}

function PrivacyPolicyPage() {
  return <TermsDetailPage title='개인정보 처리방침' type='PRIVACY_POLICY' />;
}

export { PrivacyPolicyPage, TermsDetailPage };
