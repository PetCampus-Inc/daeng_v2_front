'use client';

import { useState } from 'react';
import {
  ActionButton,
  Icon,
  TextField,
  TextFieldInput,
  Textarea,
  TextareaInput,
} from '@knockdog/ui';
import Image from 'next/image';

import {
  CONDITION_OPTIONS,
  NOTICE_WRITE_STOOL_OPTIONS,
  ownerDailyNoticeWriteContent,
  type ConditionOptionId,
  type NoticeWriteStoolStatus,
} from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';
import { formatNoticeWriteDate } from '@views/owner-daily-notice-write-page/lib/formatNoticeWriteDate';

import { Header } from '@widgets/Header';

import {
  STOOL_STATUS_DEFAULT_IMAGE,
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
} from '@shared/ui/stool-status';

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지
 * 날짜·컨디션·간식·배변·알림장 섹션 퍼블리싱
 */
function OwnerDailyNoticeWritePage() {
  const [selectedConditionId, setSelectedConditionId] = useState<ConditionOptionId | null>(null);
  const [snack, setSnack] = useState('');
  const [selectedStoolStatus, setSelectedStoolStatus] = useState<NoticeWriteStoolStatus | null>(
    null
  );
  const [stoolMemo, setStoolMemo] = useState('');
  const [notice, setNotice] = useState('');
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
          <div className='flex items-center px-4 py-8'>
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
                        ? 'border-fill-line-accent bg-fill-primary-50 text-text-accent'
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
            <TextField variant='secondary'>
              <TextFieldInput
                value={snack}
                maxLength={ownerDailyNoticeWriteContent.snackMaxLength}
                placeholder={ownerDailyNoticeWriteContent.snackPlaceholder}
                onChange={(event) => setSnack(event.target.value)}
              />
            </TextField>
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
                      className='flex w-16 flex-col items-center gap-1'
                    >
                      <div className='relative h-[62px] w-16 shrink-0 overflow-hidden rounded-lg'>
                        <Image
                          src={
                            isSelected
                              ? STOOL_STATUS_IMAGE[status]
                              : STOOL_STATUS_DEFAULT_IMAGE[status]
                          }                          alt=''
                          fill
                          className='object-contain'
                          sizes='64px'
                        />
                      </div>
                      <span
                        className={`label-medium ${
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

            <TextField variant='secondary'>
              <TextFieldInput
                value={stoolMemo}
                maxLength={ownerDailyNoticeWriteContent.stoolMemoMaxLength}
                placeholder={ownerDailyNoticeWriteContent.stoolMemoPlaceholder}
                onChange={(event) => setStoolMemo(event.target.value)}
              />
            </TextField>
          </section>

          <section className='flex flex-col gap-2 px-4 py-4'>
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
            <Textarea variant='default' className='h-[100px]'>
              <TextareaInput
                value={notice}
                maxLength={ownerDailyNoticeWriteContent.noticeMaxLength}
                placeholder={ownerDailyNoticeWriteContent.noticePlaceholder}
                onChange={(event) => setNotice(event.target.value)}
              />
            </Textarea>
          </section>
        </div>
      </div>
    </div>
  );
}

export { OwnerDailyNoticeWritePage };
