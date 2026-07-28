'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { NoticeMemoTextarea } from '@views/owner-daily-notice-write-page/ui/NoticeMemoTextarea';
import { ShortMemoTextarea } from '@views/owner-daily-notice-write-page/ui/ShortMemoTextarea';

import { consumeLoadedNoticeTemplateContent } from '@entities/owner-notice-template';
import {
  buildAttendanceRecordPayload,
  useAttendanceRecordMutation,
} from '@entities/owner-attendance-record';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { STORAGE_KEYS } from '@shared/constants/storage';
import { useStackNavigation } from '@shared/lib/bridge';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { SafeArea } from '@shared/ui/safe-area';
import {
  STOOL_STATUS_DEFAULT_IMAGE,
  STOOL_STATUS_IMAGE,
  STOOL_STATUS_LABEL,
} from '@shared/ui/stool-status';
import { toast } from '@shared/ui/toast';

interface NoticeDraft {
  selectedConditionId: ConditionOptionId | null;
  snack: string;
  selectedStoolStatus: NoticeWriteStoolStatus | null;
  stoolMemo: string;
  notice: string;
}

function getDraftStorageKey(noticeId: string) {
  return `${STORAGE_KEYS.OWNER_DAILY_NOTICE_DRAFT_PREFIX}${noticeId}`;
}

function loadNoticeDraft(noticeId: string): NoticeDraft | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(getDraftStorageKey(noticeId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as NoticeDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveNoticeDraft(noticeId: string, draft: NoticeDraft) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getDraftStorageKey(noticeId), JSON.stringify(draft));
}

function clearNoticeDraft(noticeId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getDraftStorageKey(noticeId));
}

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지
 */
function OwnerDailyNoticeWritePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const noticeId = params?.id;
  const isEditMode = searchParams.get('mode') === 'edit';
  const isExpired = searchParams.get('expired') === 'true';
  const { back, pushForResult } = useStackNavigation();
  const { draftMutation, sendMutation } = useAttendanceRecordMutation();
  const student = NOTICE_WRITE_MOCK_STUDENT;
  const [selectedConditionId, setSelectedConditionId] = useState<ConditionOptionId | null>(null);
  const [snack, setSnack] = useState('');
  const [selectedStoolStatus, setSelectedStoolStatus] = useState<NoticeWriteStoolStatus | null>(
    null
  );
  const [stoolMemo, setStoolMemo] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeWriteDate] = useState(() => createNoticeWriteDate());
  const hasOpenedEntryDialogRef = useRef(false);
  const genderIcon = student.gender === 'MALE' ? 'Male' : 'Female';
  const studentSummary = `${student.breed} ∙ ${student.weightKg}kg ∙ ${student.age}살`;
  const hasAnyContent =
    selectedConditionId !== null ||
    snack.trim().length > 0 ||
    selectedStoolStatus !== null ||
    stoolMemo.trim().length > 0 ||
    notice.trim().length > 0;
  const isSendEnabled = hasAnyContent;
  const isSubmitting = draftMutation.isPending || sendMutation.isPending;

  const buildPayload = () => {
    if (!noticeId) throw new Error('petId가 없습니다.');

    return buildAttendanceRecordPayload({
      petId: noticeId,
      date: noticeWriteDate.dateKey,
      condition: selectedConditionId,
      snack,
      poop: selectedStoolStatus,
      poopMemo: stoolMemo,
      note: notice,
    });
  };

  const currentDraft: NoticeDraft = {
    selectedConditionId,
    snack,
    selectedStoolStatus,
    stoolMemo,
    notice,
  };

  const openExpiredDialog = useCallback(() => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={() => undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeWriteContent.expiredTitle}</AlertDialogTitle>
            <AlertDialogDescription className='whitespace-pre-line'>
              {ownerDailyNoticeWriteContent.expiredDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                close();
                back();
              }}
            >
              {ownerDailyNoticeWriteContent.expiredConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [back]);

  const applyDraft = (draft: NoticeDraft) => {
    setSelectedConditionId(draft.selectedConditionId);
    setSnack(draft.snack);
    setSelectedStoolStatus(draft.selectedStoolStatus);
    setStoolMemo(draft.stoolMemo);
    setNotice(draft.notice);
  };

  const openTemplatePage = async () => {
    if (!noticeId) return;

    try {
      const result = await pushForResult<{ content: string }>({
        pathname: route.owner.daily.notice.template.root.replace('[id]', noticeId),
      });
      const bridgedContent = result?.content;
      if (typeof bridgedContent === 'string') {
        setNotice(bridgedContent);
        return;
      }

      const loadedContent = consumeLoadedNoticeTemplateContent();
      if (loadedContent !== null) setNotice(loadedContent);
    } catch {
      const loadedContent = consumeLoadedNoticeTemplateContent();
      if (loadedContent !== null) setNotice(loadedContent);
    }
  };

  const handleLoadTemplateClick = async () => {
    if (isExpired) {
      openExpiredDialog();
      return;
    }
    if (!noticeId) return;

    if (notice.trim().length === 0) {
      await openTemplatePage();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeWriteContent.loadTemplateConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerDailyNoticeWriteContent.loadTemplateConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ownerDailyNoticeWriteContent.loadTemplateConfirmNoLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                openTemplatePage();
              }}
            >
              {ownerDailyNoticeWriteContent.loadTemplateConfirmYesLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleDraftSaveClick = async () => {
    if (!noticeId || isSubmitting) return;
    if (isExpired) {
      openExpiredDialog();
      return;
    }

    if (!hasAnyContent) {
      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={close}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ownerDailyNoticeWriteContent.emptyDraftTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {ownerDailyNoticeWriteContent.emptyDraftDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>{ownerDailyNoticeWriteContent.emptyDraftConfirmLabel}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
      return;
    }

    try {
      await draftMutation.mutateAsync(buildPayload());
      saveNoticeDraft(noticeId, currentDraft);
      toast({
        nativeTitle: '작성 중인 알림장을 임시저장했어요',
        title: (
          <>
            <span className='text-text-accent'>작성 중인 알림장</span>
            <span className='text-text-primary-inverse'>을 임시저장했어요</span>
          </>
        ),
      });
    } catch {
      toast({
        nativeTitle: '임시저장하지 못했어요. 다시 시도해 주세요',
        title: (
          <>
            <span className='text-text-accent'>임시저장</span>
            <span className='text-text-primary-inverse'>하지 못했어요. 다시 시도해 주세요</span>
          </>
        ),
      });
    }
  };

  const submitNotice = async () => {
    if (!noticeId || isSubmitting) return;
    if (isExpired) {
      openExpiredDialog();
      return;
    }

    try {
      await sendMutation.mutateAsync(buildPayload());
      clearNoticeDraft(noticeId);
      toast({
        nativeTitle: '알림장을 보냈어요. 오늘까지 수정할 수 있어요',
        title: (
          <>
            <span className='text-text-accent'>알림장</span>
            <span className='text-text-primary-inverse'>을 보냈어요. 오늘까지 수정할 수 있어요</span>
          </>
        ),
      });
      back();
    } catch {
      try {
        await draftMutation.mutateAsync(buildPayload());
        saveNoticeDraft(noticeId, currentDraft);
      } catch {
        saveNoticeDraft(noticeId, currentDraft);
      }

      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={close}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ownerDailyNoticeWriteContent.sendFailedTitle}</AlertDialogTitle>
              <AlertDialogDescription className='whitespace-pre-line'>
                {ownerDailyNoticeWriteContent.sendFailedDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{ownerDailyNoticeWriteContent.sendFailedCloseLabel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  close();
                  submitNotice();
                }}
              >
                {ownerDailyNoticeWriteContent.sendFailedRetryLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
    }
  };

  const handleSendClick = () => {
    if (!isSendEnabled) return;
    if (isExpired) {
      openExpiredDialog();
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditMode
                ? ownerDailyNoticeWriteContent.editSendConfirmTitle
                : ownerDailyNoticeWriteContent.sendConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode
                ? ownerDailyNoticeWriteContent.editSendConfirmDescription
                : ownerDailyNoticeWriteContent.sendConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ownerDailyNoticeWriteContent.sendConfirmCloseLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                submitNotice();
              }}
            >
              {ownerDailyNoticeWriteContent.sendConfirmActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  useEffect(() => {
    if (!noticeId || hasOpenedEntryDialogRef.current) return;
    hasOpenedEntryDialogRef.current = true;

    if (isExpired) {
      openExpiredDialog();
      return;
    }

    const loadedTemplateContent = consumeLoadedNoticeTemplateContent();
    if (loadedTemplateContent !== null) {
      setNotice(loadedTemplateContent);
      return;
    }

    const draft = loadNoticeDraft(noticeId);
    if (!draft) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={() => undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeWriteContent.resumeDraftTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerDailyNoticeWriteContent.resumeDraftDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                clearNoticeDraft(noticeId);
                close();
              }}
            >
              {ownerDailyNoticeWriteContent.resumeDraftNewLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                applyDraft(draft);
                close();
              }}
            >
              {ownerDailyNoticeWriteContent.resumeDraftContinueLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [isExpired, noticeId, openExpiredDialog]);

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
            <button
              type='button'
              className='body2-semibold text-text-primary-inverse h-x7 radius-r1 disabled:opacity-50'
              disabled={isSubmitting}
              onClick={handleDraftSaveClick}
            >
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
                onClick={handleLoadTemplateClick}
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
              disabled={!isSendEnabled || isSubmitting}
              onClick={handleSendClick}
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
