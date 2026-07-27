'use client';

import { useState } from 'react';

import { Icon } from '@knockdog/ui';

import { Header } from '@widgets/Header';

import {
  CONDITION_OPTIONS,
  NOTICE_WRITE_SECTIONS,
  ownerDailyNoticeWriteContent,
  type ConditionOptionId,
} from '../config/ownerDailyNoticeWriteContent';
import { formatNoticeWriteDate } from '../lib/formatNoticeWriteDate';

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지
 * 날짜·컨디션까지 퍼블리싱, 나머지 섹션은 라벨만
 */
function OwnerDailyNoticeWritePage() {
  const [selectedConditionId, setSelectedConditionId] = useState<ConditionOptionId | null>(null);
  const noticeDateLabel = formatNoticeWriteDate(new Date());

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <div className='relative overflow-hidden pt-(--safe-area-inset-top,0px)'>
        <Icon
          icon='Paw'
          aria-hidden='true'
          className='text-primitive-orange-300 pointer-events-none absolute top-0 -right-[72px] size-[240px] -rotate-30 opacity-20'
        />

        <Header variant='transparent'>
          <Header.LeftSection>
            <Header.BackButton className='text-text-primary-inverse' />
          </Header.LeftSection>
          <Header.Title className='text-text-primary-inverse'>
            {ownerDailyNoticeWriteContent.pageTitle}
          </Header.Title>
          <Header.RightSection>
            <button type='button' className='body2-semibold text-text-primary-inverse h-x7 radius-r1'>
              {ownerDailyNoticeWriteContent.draftSaveLabel}
            </button>
          </Header.RightSection>
        </Header>

        {/* 프로필 헤더 영역 placeholder (아바타·이름 등 이후 배치) */}
        <div className='h-[140px]' aria-hidden />
      </div>

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px]'>
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          <div className='flex items-center px-4 py-4'>
            <p className='h2-semibold text-text-primary'>{noticeDateLabel}</p>
          </div>

          <section className='flex flex-col gap-2 px-4 py-4'>
            <h2 className='body2-bold text-text-primary'>
              {ownerDailyNoticeWriteContent.conditionSectionLabel}
            </h2>
            <div className='flex flex-wrap gap-2'>
              {CONDITION_OPTIONS.map((option) => {
                const isSelected = selectedConditionId === option.id;

                return (
                  <button
                    key={option.id}
                    type='button'
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedConditionId((current) =>
                        current === option.id ? null : option.id
                      )
                    }
                    className={`body2-semibold rounded-full border-[1.4px] px-3 py-2 ${
                      isSelected
                        ? 'border-fill-secondary-700 bg-fill-secondary-700 text-text-primary-inverse'
                        : 'border-line-200 bg-fill-secondary-0 text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          {NOTICE_WRITE_SECTIONS.map((section) => (
            <section key={section.id} className='flex flex-col gap-2 px-4 py-4'>
              <h2 className='body2-bold text-text-primary'>{section.label}</h2>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export { OwnerDailyNoticeWritePage };
