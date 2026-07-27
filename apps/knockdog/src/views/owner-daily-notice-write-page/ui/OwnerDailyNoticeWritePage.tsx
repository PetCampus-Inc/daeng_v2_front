'use client';

import { useState } from 'react';
import {
  ActionButton,
  Icon,
} from '@knockdog/ui';
import Image from 'next/image';

import {
  CONDITION_OPTIONS,
  NOTICE_WRITE_MOCK_STUDENT,
  NOTICE_WRITE_STOOL_OPTIONS,
  ownerDailyNoticeWriteContent,
  type ConditionOptionId,
  type NoticeWriteStoolStatus,
} from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';
import { createNoticeWriteDate } from '@views/owner-daily-notice-write-page/lib/formatNoticeWriteDate';

import { Header } from '@widgets/Header';

import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { SafeArea } from '@shared/ui/safe-area';
import {
  STOOL_STATUS_DEFAULT_IMAGE,
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
} from '@shared/ui/stool-status';

import { NoticeMemoTextarea } from './NoticeMemoTextarea';
import { ShortMemoTextarea } from './ShortMemoTextarea';

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지
 */
function OwnerDailyNoticeWritePage() {
  const student = NOTICE_WRITE_MOCK_STUDENT;
  const [selectedConditionId, setSelectedConditionId] = useState<ConditionOptionId | null>(null);
  const [snack, setSnack] = useState('');
  const [selectedStoolStatus, setSelectedStoolStatus] = useState<NoticeWriteStoolStatus | null>(
    null
  );
  const [stoolMemo, setStoolMemo] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeWriteDate] = useState(() => createNoticeWriteDate());

  const genderIcon = student.gender === 'MALE' ? 'Male' : 'Female';
  const studentSummary = `${student.breed} ∙ ${student.weightKg}kg ∙ ${student.age}살`;
  const isSendEnabled =
    selectedConditionId !== null ||
    snack.trim().length > 0 ||
    selectedStoolStatus !== null ||
    stoolMemo.trim().length > 0 ||
    notice.trim().length > 0;

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

        <div className='flex items-start gap-2 px-4 py-4'>
          <DogProfileAvatar name={student.name} imageUrl={student.profileImageUrl} />

          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <p className='body1-extrabold text-text-primary-inverse'>{student.name}</p>
              <Icon icon={genderIcon} className='text-text-primary-inverse size-4' />
            </div>
            <p className='body1-medium text-text-primary-inverse'>{studentSummary}</p>
            <div className='body1-medium text-text-primary-inverse flex items-center gap-1'>
              <span>{student.guardianName}</span>
              <span>{ownerDailyNoticeWriteContent.guardianLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px]'>
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          <div className='bg-bg-0 sticky top-0 z-10 flex items-center px-4 py-8'>
            <p className='h2-semibold text-text-primary'>{noticeWriteDate.label}</p>
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
                        ? 'border-line-accent bg-fill-primary-50 text-text-accent'
                        : 'border-line-200 bg-fill-secondary-0 text-text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className='flex flex-col gap-2 px-4 py-4'>
            <h2 className='body2-bold text-text-primary'>
              {ownerDailyNoticeWriteContent.snackSectionLabel}
            </h2>
            <ShortMemoTextarea
              value={snack}
              maxLength={ownerDailyNoticeWriteContent.snackMaxLength}
              placeholder={ownerDailyNoticeWriteContent.snackPlaceholder}
              onChange={setSnack}
            />
          </section>

          <section className='flex flex-col gap-4 px-4 py-4'>
            <div className='flex flex-col gap-2'>
              <h2 className='body2-bold text-text-primary'>
                {ownerDailyNoticeWriteContent.stoolSectionLabel}
              </h2>
              <div className='flex items-center justify-between'>
                {NOTICE_WRITE_STOOL_OPTIONS.map((status) => {
                  const isSelected = selectedStoolStatus === status;
                  const label = STOOL_STATUS_LABEL[status];

                  return (
                    <button
                      key={status}
                      type='button'
                      aria-pressed={isSelected}
                      aria-label={label}
                      onClick={() =>
                        setSelectedStoolStatus((current) =>
                          current === status ? null : status
                        )
                      }
                      className='flex flex-col items-center gap-2'
                    >
                      <div className='relative size-[52px] shrink-0 overflow-hidden rounded-lg'>
                        <Image
                          src={
                            isSelected
                              ? STOOL_STATUS_IMAGE[status]
                              : STOOL_STATUS_DEFAULT_IMAGE[status]
                          }
                          alt=''
                          fill
                          className='object-contain'
                          sizes='52px'
                        />
                      </div>
                      <span
                        className={`caption1-semibold whitespace-nowrap text-center ${
                          isSelected ? 'text-text-accent' : 'text-text-tertiary'
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ShortMemoTextarea
              value={stoolMemo}
              maxLength={ownerDailyNoticeWriteContent.stoolMemoMaxLength}
              placeholder={ownerDailyNoticeWriteContent.stoolMemoPlaceholder}
              onChange={setStoolMemo}
            />
          </section>

          <section className='flex flex-col gap-2 px-4 py-4 pb-6'>
            <div className='flex items-center justify-between gap-2'>
              <h2 className='body2-bold text-text-primary'>
                {ownerDailyNoticeWriteContent.noticeSectionLabel}
              </h2>
              <ActionButton
                type='button'
                variant='secondaryLine'
                size='small'
                className='caption2-semibold h-auto w-auto shrink-0 px-3 py-2'
              >
                {ownerDailyNoticeWriteContent.loadTemplateLabel}
              </ActionButton>
            </div>
            <NoticeMemoTextarea
              value={notice}
              maxLength={ownerDailyNoticeWriteContent.noticeMaxLength}
              placeholder={ownerDailyNoticeWriteContent.noticePlaceholder}
              onChange={setNotice}
            />
          </section>
        </div>

        <SafeArea edges={['bottom']} className='bg-bg-0 shrink-0'>
          <div className='px-4 py-5'>
            <ActionButton
              type='button'
              variant='primaryFill'
              size='large'
              className='w-full'
              disabled={!isSendEnabled}
            >
              {ownerDailyNoticeWriteContent.sendButtonLabel}
            </ActionButton>
          </div>
        </SafeArea>
      </div>
    </div>
  );
}

export { OwnerDailyNoticeWritePage };
