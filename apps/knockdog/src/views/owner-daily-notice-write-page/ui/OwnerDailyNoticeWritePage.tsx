'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  NOTICE_WRITE_STOOL_OPTIONS,
  ownerDailyNoticeWriteContent,
  type ConditionOptionId,
  type NoticeWriteStoolStatus,
} from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';
import { createNoticeWriteDate } from '@views/owner-daily-notice-write-page/lib/formatNoticeWriteDate';
import {
  openExpiredNoticeDialog,
} from '@views/owner-daily-notice-write-page/lib/useExpiredNoticeDialog';
import { NoticeMemoTextarea } from '@views/owner-daily-notice-write-page/ui/NoticeMemoTextarea';
import { ShortMemoTextarea } from '@views/owner-daily-notice-write-page/ui/ShortMemoTextarea';

import {
  consumeLoadedNoticeTemplateContent,
  peekLoadedNoticeTemplateContent,
} from '@entities/owner-notice-template';
import {
  buildAttendanceRecordPayload,
  normalizeAttendanceRecordCondition,
  normalizeAttendanceRecordPoop,
  ownerAttendanceRecordQueryKey,
  toAttendanceRecordDtoFromPayload,
  useAttendanceRecordMutation,
  useAttendanceRecordQuery,
} from '@entities/owner-attendance-record';
import {
  findOwnerMemberByDogName,
  findOwnerMemberByPetId,
  useOwnerMembersQuery,
} from '@entities/owner-member';
import { useOwnerPetQuery } from '@entities/owner-pet';
import { formatAge } from '@entities/pet';
import { useUserStore } from '@entities/user';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { STORAGE_KEYS } from '@shared/constants/storage';
import { trackNotebookAction } from '@shared/lib/analytics';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';
import { safeLocalStorage, safeSessionStorage } from '@shared/lib/storage';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

interface NoticeDraft {
  selectedConditionId: ConditionOptionId | null;
  snack: string;
  selectedStoolStatus: NoticeWriteStoolStatus | null;
  stoolMemo: string;
  notice: string;
}

interface NoticeSendAttempt {
  idempotencyKey: string;
  payloadSignature: string;
}

function getDraftStorageKey(noticeId: string, dateKey: string) {
  return `${STORAGE_KEYS.OWNER_DAILY_NOTICE_DRAFT_PREFIX}${noticeId}:${dateKey}`;
}

function getTemplateRoundTripStorageKey(noticeId: string) {
  return `${STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_ROUNDTRIP}:${noticeId}`;
}

function markTemplateRoundTrip(noticeId: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(getTemplateRoundTripStorageKey(noticeId), '1');
}

function consumeTemplateRoundTrip(noticeId: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = getTemplateRoundTripStorageKey(noticeId);
  const exists = sessionStorage.getItem(key) !== null;
  if (exists) sessionStorage.removeItem(key);
  return exists;
}

function peekTemplateRoundTrip(noticeId: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(getTemplateRoundTripStorageKey(noticeId)) !== null;
}

function isConditionOptionId(value: unknown): value is ConditionOptionId {
  return CONDITION_OPTIONS.some((option) => option.id === value);
}

function normalizeConditionOptionId(value: unknown): ConditionOptionId | null {
  const normalized = normalizeAttendanceRecordCondition(value);
  return isConditionOptionId(normalized) ? normalized : null;
}

function isNoticeWriteStoolStatus(value: unknown): value is NoticeWriteStoolStatus {
  return NOTICE_WRITE_STOOL_OPTIONS.some((option) => option.id === value);
}

function normalizeNoticeWriteStoolStatus(value: unknown): NoticeWriteStoolStatus | null {
  const normalized = normalizeAttendanceRecordPoop(value);
  return isNoticeWriteStoolStatus(normalized) ? normalized : null;
}

function normalizeNoticeDraft(value: unknown): NoticeDraft | null {
  if (!value || typeof value !== 'object') return null;

  const draft = value as Record<string, unknown>;

  return {
    selectedConditionId: normalizeConditionOptionId(draft.selectedConditionId),
    snack: typeof draft.snack === 'string' ? draft.snack : '',
    selectedStoolStatus: normalizeNoticeWriteStoolStatus(draft.selectedStoolStatus),
    stoolMemo: typeof draft.stoolMemo === 'string' ? draft.stoolMemo : '',
    notice: typeof draft.notice === 'string' ? draft.notice : '',
  };
}

function loadNoticeDraft(noticeId: string, dateKey: string): NoticeDraft | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(getDraftStorageKey(noticeId, dateKey));
  if (!raw) return null;

  try {
    return normalizeNoticeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveNoticeDraft(noticeId: string, dateKey: string, draft: NoticeDraft) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getDraftStorageKey(noticeId, dateKey), JSON.stringify(draft));
}

function clearNoticeDraft(noticeId: string, dateKey: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getDraftStorageKey(noticeId, dateKey));
}

const EMPTY_NOTICE_DRAFT: NoticeDraft = {
  selectedConditionId: null,
  snack: '',
  selectedStoolStatus: null,
  stoolMemo: '',
  notice: '',
};

function areNoticeDraftsEqual(a: NoticeDraft, b: NoticeDraft) {
  return (
    a.selectedConditionId === b.selectedConditionId &&
    a.snack === b.snack &&
    a.selectedStoolStatus === b.selectedStoolStatus &&
    a.stoolMemo === b.stoolMemo &&
    a.notice === b.notice
  );
}

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지
 */
function OwnerDailyNoticeWritePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const noticeId = params?.id;
  const isEditQuery = searchParams.get('mode') === 'edit';
  const isExpired = searchParams.get('expired') === 'true';
  const { pushForResult, replace, reset } = useStackNavigation();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const { draftMutation, sendMutation } = useAttendanceRecordMutation();
  const [noticeWriteDate] = useState(() => createNoticeWriteDate());
  const { data: attendanceRecord } = useAttendanceRecordQuery({
    petId: noticeId,
    date: noticeWriteDate.dateKey,
  });
  const { data: membersData } = useOwnerMembersQuery({ userId });
  const resolvedPetId = attendanceRecord ? String(attendanceRecord.petId) : noticeId;
  const { data: pet } = useOwnerPetQuery({ petId: resolvedPetId });
  const members = membersData?.members ?? [];
  const studentByPetId = findOwnerMemberByPetId(members, resolvedPetId);
  const studentByDogName = findOwnerMemberByDogName(members, pet?.name);
  const student = studentByPetId ?? studentByDogName;
  const [selectedConditionId, setSelectedConditionId] = useState<ConditionOptionId | null>(null);
  const [snack, setSnack] = useState('');
  const [selectedStoolStatus, setSelectedStoolStatus] = useState<NoticeWriteStoolStatus | null>(
    null
  );
  const [stoolMemo, setStoolMemo] = useState('');
  const [notice, setNotice] = useState('');
  const [isEditingSent, setIsEditingSent] = useState(isEditQuery);
  const [hydratedRecordKey, setHydratedRecordKey] = useState<string | null>(null);
  const hasOpenedEntryDialogRef = useRef(false);
  const draftRef = useRef<NoticeDraft>(EMPTY_NOTICE_DRAFT);
  /** 임시저장/서버 hydrate 기준 — 이후 수정분만 이탈 모달 */
  const persistedDraftRef = useRef<NoticeDraft>(EMPTY_NOTICE_DRAFT);
  const isExitDialogOpenRef = useRef(false);
  const sendAttemptRef = useRef<NoticeSendAttempt | null>(null);

  const hasSentRecord = attendanceRecord?.status === 'SENT';
  const isReadOnly = hasSentRecord && !isEditingSent;
  const canDraftSave = !hasSentRecord;
  const isEditMode = hasSentRecord && isEditingSent;
  const recordHydrateKey = attendanceRecord
    ? `${attendanceRecord.petId}:${attendanceRecord.date}:${attendanceRecord.status}`
    : null;

  if (attendanceRecord && recordHydrateKey && recordHydrateKey !== hydratedRecordKey) {
    setHydratedRecordKey(recordHydrateKey);

    // 템플릿 왕복 remount: API hydrate로 로컬 작성값을 덮지 않고 draft(+템플릿 본문) 복원
    const isTemplateRoundTrip = noticeId != null && peekTemplateRoundTrip(noticeId);
    const pendingTemplate =
      noticeId != null ? peekLoadedNoticeTemplateContent(noticeId) : null;
    const draft =
      noticeId != null ? loadNoticeDraft(noticeId, noticeWriteDate.dateKey) : null;

    if ((isTemplateRoundTrip || pendingTemplate !== null) && draft) {
      const nextDraft: NoticeDraft = {
        selectedConditionId: draft.selectedConditionId,
        snack: draft.snack,
        selectedStoolStatus: draft.selectedStoolStatus,
        stoolMemo: draft.stoolMemo,
        notice: pendingTemplate ?? draft.notice,
      };
      setSelectedConditionId(nextDraft.selectedConditionId);
      setSnack(nextDraft.snack);
      setSelectedStoolStatus(nextDraft.selectedStoolStatus);
      setStoolMemo(nextDraft.stoolMemo);
      setNotice(nextDraft.notice);
      // 템플릿 적용분은 미저장 변경으로 취급 — baseline은 로컬 draft(임시저장본)
      persistedDraftRef.current = draft;
    } else if (pendingTemplate !== null) {
      const nextDraft: NoticeDraft = {
        selectedConditionId: normalizeConditionOptionId(attendanceRecord.condition),
        snack: attendanceRecord.snack,
        selectedStoolStatus: normalizeNoticeWriteStoolStatus(attendanceRecord.poop),
        stoolMemo: attendanceRecord.poopMemo,
        notice: pendingTemplate,
      };
      setSelectedConditionId(nextDraft.selectedConditionId);
      setSnack(nextDraft.snack);
      setSelectedStoolStatus(nextDraft.selectedStoolStatus);
      setStoolMemo(nextDraft.stoolMemo);
      setNotice(nextDraft.notice);
      persistedDraftRef.current = {
        ...nextDraft,
        notice: attendanceRecord.note,
      };
    } else {
      const nextDraft: NoticeDraft = {
        selectedConditionId: normalizeConditionOptionId(attendanceRecord.condition),
        snack: attendanceRecord.snack,
        selectedStoolStatus: normalizeNoticeWriteStoolStatus(attendanceRecord.poop),
        stoolMemo: attendanceRecord.poopMemo,
        notice: attendanceRecord.note,
      };
      setSelectedConditionId(nextDraft.selectedConditionId);
      setSnack(nextDraft.snack);
      setSelectedStoolStatus(nextDraft.selectedStoolStatus);
      setStoolMemo(nextDraft.stoolMemo);
      setNotice(nextDraft.notice);
      persistedDraftRef.current = nextDraft;
    }
  }

  const dogName = pet?.name ?? student?.dogName ?? '';
  const guardianName = student?.guardianName ?? '';
  const profileImageUrl = pet?.profileImageUrl ?? student?.profileImageUrl ?? undefined;
  const genderIcon = pet?.gender === 'MALE' ? 'Male' : 'Female';
  const petSummary = [
    pet?.breed?.trim(),
    typeof pet?.weightKg === 'number' ? `${pet.weightKg}kg` : '',
    formatAge(pet?.birthYear),
  ]
    .filter(Boolean)
    .join(' ∙ ');
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
  draftRef.current = currentDraft;

  const returnToOwnerDailyTodayAttendance = useCallback(async () => {
    // Stack/Tab WebView sessionStorage 분리 → localStorage로 Tab과 공유
    safeLocalStorage.set(STORAGE_KEYS.OWNER_DAILY_TAB, 'today-attendance');
    safeSessionStorage.set(STORAGE_KEYS.OWNER_DAILY_TAB, 'today-attendance');
    const query = { tab: 'today-attendance' };

    // navigateToTab만 하면 발송 후 Stack reset으로 Tabs가 remount된 뒤
    // reset으로 Tabs(OwnerDaily)+query를 명시함.
    await reset(route.owner.daily.root, query);
  }, [reset]);

  const openExpiredDialog = useCallback(() => {
    openExpiredNoticeDialog(returnToOwnerDailyTodayAttendance);
  }, [returnToOwnerDailyTodayAttendance]);

  const applyDraft = (draft: NoticeDraft, options?: { asPersisted?: boolean }) => {
    setSelectedConditionId(draft.selectedConditionId);
    setSnack(draft.snack);
    setSelectedStoolStatus(draft.selectedStoolStatus);
    setStoolMemo(draft.stoolMemo);
    setNotice(draft.notice);
    if (options?.asPersisted) {
      persistedDraftRef.current = draft;
    }
  };

  const handleBackClick = useCallback(() => {
    if (isReadOnly) {
      returnToOwnerDailyTodayAttendance();
      return;
    }

    const hasUnsavedChanges = !areNoticeDraftsEqual(draftRef.current, persistedDraftRef.current);
    if (!hasUnsavedChanges) {
      returnToOwnerDailyTodayAttendance();
      return;
    }

    if (isExitDialogOpenRef.current) return;
    isExitDialogOpenRef.current = true;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            isExitDialogOpenRef.current = false;
            close();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerDailyNoticeWriteContent.unsavedExitTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerDailyNoticeWriteContent.unsavedExitDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ownerDailyNoticeWriteContent.unsavedExitCancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => returnToOwnerDailyTodayAttendance()}>
              {ownerDailyNoticeWriteContent.unsavedExitConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [isReadOnly, returnToOwnerDailyTodayAttendance]);

  useNativeBackHandler(handleBackClick);

  const openTemplatePage = async () => {
    if (!noticeId) return;

    // remount 시 다른 필드 유지를 위해 로컬 draft 저장 (본문만 템플릿으로 교체)
    saveNoticeDraft(noticeId, noticeWriteDate.dateKey, draftRef.current);
    markTemplateRoundTrip(noticeId);

    try {
      const result = await pushForResult<{ content: string }>({
        pathname: route.owner.daily.notice.template.root.replace('[id]', noticeId),
        query: {
          ...(isExpired ? { expired: 'true' } : {}),
        },
      });
      const bridgedContent = result?.content;
      if (typeof bridgedContent === 'string') {
        setNotice(bridgedContent);
        // remount 없이 돌아온 경우 왕복 플래그 + 템플릿 본문 모두 정리해
        // 이후 재진입 시 sessionStorage stale 템플릿이 다시 적용되지 않게 함.
        consumeLoadedNoticeTemplateContent(noticeId);
        consumeTemplateRoundTrip(noticeId);
        return;
      }

      const loadedContent = consumeLoadedNoticeTemplateContent(noticeId);
      if (loadedContent !== null) setNotice(loadedContent);
      consumeTemplateRoundTrip(noticeId);
    } catch {
      const loadedContent = consumeLoadedNoticeTemplateContent(noticeId);
      if (loadedContent !== null) setNotice(loadedContent);
      consumeTemplateRoundTrip(noticeId);
    }
  };

  const handleLoadTemplateClick = async () => {
    if (isReadOnly) return;
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
    if (!noticeId || isSubmitting || !canDraftSave) return;
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
      const payload = buildPayload();
      await draftMutation.mutateAsync(payload);
      saveNoticeDraft(noticeId, noticeWriteDate.dateKey, currentDraft);
      persistedDraftRef.current = currentDraft;
      queryClient.setQueryData(ownerAttendanceRecordQueryKey(noticeId, noticeWriteDate.dateKey), {
        status: 200,
        code: 'OK',
        message: '',
        data: toAttendanceRecordDtoFromPayload(payload, 'DRAFT'),
      });
      toast({
        type: 'success',
        shape: 'rounded',
        position: 'bottom',
        nativeTitle: '작성 중인 알림장을 임시저장했어요',
        titleParts: [
          { text: '작성 중인 알림장', accent: true },
          { text: '을 임시저장했어요' },
        ],
        title: (
          <>
            <span className='body1-bold text-text-accent'>작성 중인 알림장</span>
            <span className='body1-medium text-text-primary-inverse'>을 임시저장했어요</span>
          </>
        ),
      });
    } catch {
      toast({
        shape: 'rounded',
        position: 'bottom',
        nativeTitle: '임시저장하지 못했어요. 다시 시도해 주세요',
        titleParts: [
          { text: '임시저장', accent: true },
          { text: '하지 못했어요. 다시 시도해 주세요' },
        ],
        title: (
          <>
            <span className='body1-bold text-text-accent'>임시저장</span>
            <span className='body1-medium text-text-primary-inverse'>하지 못했어요. 다시 시도해 주세요</span>
          </>
        ),
      });
    }
  };

  const handleEditClick = () => {
    if (isExpired) {
      openExpiredDialog();
      return;
    }
    setIsEditingSent(true);
    // 템플릿 왕복 remount 시에도 수정 모드 유지
    if (!noticeId) return;
    replace({
      pathname: route.owner.daily.notice.write.root.replace('[id]', noticeId),
      query: {
        mode: 'edit',
        ...(isExpired ? { expired: 'true' } : {}),
      },
    });
  };

  const submitNotice = async () => {
    if (!noticeId || isSubmitting) return;
    if (isExpired) {
      openExpiredDialog();
      return;
    }

    const payload = buildPayload();

    try {
      const payloadSignature = JSON.stringify(payload);
      const previousAttempt = sendAttemptRef.current;
      const idempotencyKey =
        previousAttempt?.payloadSignature === payloadSignature
          ? previousAttempt.idempotencyKey
          : crypto.randomUUID();

      sendAttemptRef.current = { idempotencyKey, payloadSignature };
      await sendMutation.mutateAsync({ payload, idempotencyKey });
    } catch {
      trackNotebookAction({
        action: isEditMode ? 'edit' : 'send',
        role: 'owner',
        result: 'fail',
      });

      // SENT 수정 실패 시 draft를 저장해도 재진입 시 attendanceRecord(SENT) hydrate가
      // draft 복원을 막고, 임시저장 안내가 실제 복원과 불일치함 → 현재 화면에서 재시도만 유도
      if (!isEditMode) {
        try {
          await draftMutation.mutateAsync(buildPayload());
          saveNoticeDraft(noticeId, noticeWriteDate.dateKey, currentDraft);
        } catch {
          saveNoticeDraft(noticeId, noticeWriteDate.dateKey, currentDraft);
        }
      }

      overlay.open(({ isOpen, close }) => (
        <AlertDialog open={isOpen} onOpenChange={close}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ownerDailyNoticeWriteContent.sendFailedTitle}</AlertDialogTitle>
              <AlertDialogDescription className='whitespace-pre-line'>
                {isEditMode
                  ? ownerDailyNoticeWriteContent.editSendFailedDescription
                  : ownerDailyNoticeWriteContent.sendFailedDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{ownerDailyNoticeWriteContent.sendFailedCloseLabel}</AlertDialogCancel>
              <AlertDialogAction
                disabled={isSubmitting}
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
      return;
    }

    sendAttemptRef.current = null;
    trackNotebookAction({
      action: isEditMode ? 'edit' : 'send',
      role: 'owner',
      result: 'success',
    });

    try {
      clearNoticeDraft(noticeId, noticeWriteDate.dateKey);

      queryClient.setQueryData(ownerAttendanceRecordQueryKey(noticeId, noticeWriteDate.dateKey), {
        status: 200,
        code: 'OK',
        message: '',
        data: toAttendanceRecordDtoFromPayload(payload, 'SENT'),
      });
      setIsEditingSent(false);
      safeLocalStorage.set(STORAGE_KEYS.OWNER_DAILY_TAB, 'today-attendance');
      safeSessionStorage.set(STORAGE_KEYS.OWNER_DAILY_TAB, 'today-attendance');
      // replace만 하면 템플릿 push로 쌓인 중간 Stack이 남아 뒤로가기 시 템플릿으로 돌아감.
      // reset으로 [OwnerDaily, 작성]만 남겨 뒤로가기가 /owner/daily로 가게 함.
      await reset(route.owner.daily.notice.write.root.replace('[id]', noticeId), {
        ...(isExpired ? { expired: 'true' } : {}),
      });

      toast({
        type: 'success',
        shape: 'rounded',
        position: 'bottom',
        nativeTitle: '알림장을 보냈어요. 오늘까지 수정할 수 있어요',
        titleParts: [
          { text: '알림장', accent: true },
          { text: '을 보냈어요. 오늘까지 수정할 수 있어요' },
        ],
        title: (
          <>
            <span className='body1-bold text-text-accent'>알림장</span>
            <span className='body1-medium text-text-primary-inverse'>을 보냈어요. 오늘까지 수정할 수 있어요</span>
          </>
        ),
      });
    } catch (postSuccessError) {
      console.error('[owner-daily-notice] post-send handling failed', postSuccessError);
    }
  };

  const handleSendClick = () => {
    if (!isSendEnabled || isReadOnly) return;
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
              disabled={isSubmitting}
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
    if (attendanceRecord === undefined) return;

    hasOpenedEntryDialogRef.current = true;

    if (isExpired) {
      openExpiredDialog();
      return;
    }

    const isTemplateRoundTrip = consumeTemplateRoundTrip(noticeId);
    const loadedTemplateContent = consumeLoadedNoticeTemplateContent(noticeId);

    if (isTemplateRoundTrip || loadedTemplateContent !== null) {
      const draft = loadNoticeDraft(noticeId, noticeWriteDate.dateKey);
      if (draft) {
        const nextDraft: NoticeDraft = {
          ...draft,
          notice: loadedTemplateContent ?? draft.notice,
        };
        applyDraft(nextDraft);
        // 로컬 임시저장본은 baseline, 템플릿으로 바뀐 본문만 dirty
        persistedDraftRef.current = draft;
      } else if (loadedTemplateContent !== null) {
        setNotice(loadedTemplateContent);
      }
      if (attendanceRecord?.status === 'SENT') {
        setIsEditingSent(true);
      }
      return;
    }

    if (attendanceRecord) return;

    const draft = loadNoticeDraft(noticeId, noticeWriteDate.dateKey);
    if (!draft) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
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
                clearNoticeDraft(noticeId, noticeWriteDate.dateKey);
                close();
              }}
            >
              {ownerDailyNoticeWriteContent.resumeDraftNewLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                applyDraft(draft, { asPersisted: true });
                close();
              }}
            >
              {ownerDailyNoticeWriteContent.resumeDraftContinueLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [attendanceRecord, isExpired, noticeId, noticeWriteDate.dateKey, openExpiredDialog]);

  return (
    /**
     * `(stack)/layout` SafeArea가 이미 top inset을 줌
     * 여기 또 pt 하면 상태바 아래 빈 띠 여백이 생겨서, 레이아웃 inset은 -mt로 상쇄하고
     * 주황 헤더가 edge-to-edge로 상태바 뒤까지 칠해지게 한 뒤 콘텐츠만 pt로 내림
     */
    <div
      className='-mt-[var(--safe-area-inset-top,0px)] relative flex h-dvh flex-col pt-(--safe-area-inset-top,0px)'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <ActionLoadingOverlay isPending={isSubmitting} />
      <div className='relative overflow-hidden'>
        <Icon
          icon='Paw'
          aria-hidden='true'
          className='text-primitive-orange-300 pointer-events-none absolute top-0 -right-[72px] size-[240px] -rotate-30 opacity-20'
        />

        <Header variant='transparent'>
          <Header.LeftSection>
            <Header.BackButton className='text-text-primary-inverse' onClick={handleBackClick} />
          </Header.LeftSection>
          <Header.Title className='text-text-primary-inverse'>
            {ownerDailyNoticeWriteContent.pageTitle}
          </Header.Title>
          <Header.RightSection>
            {isReadOnly ? (
              <button
                type='button'
                className='body2-semibold text-text-primary-inverse h-x7 radius-r1'
                onClick={handleEditClick}
              >
                {ownerDailyNoticeWriteContent.editButtonLabel}
              </button>
            ) : canDraftSave ? (
              <button
                type='button'
                className='body2-semibold text-text-primary-inverse h-x7 radius-r1 disabled:opacity-50'
                disabled={isSubmitting}
                onClick={handleDraftSaveClick}
              >
                {ownerDailyNoticeWriteContent.draftSaveLabel}
              </button>
            ) : null}
          </Header.RightSection>
        </Header>

        <div className='flex items-start gap-2 px-4 py-4'>
          <DogProfileAvatar name={dogName || '강아지'} imageUrl={profileImageUrl} />

          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <p className='body1-extrabold text-text-primary-inverse'>{dogName}</p>
              {pet?.gender ? (
                <Icon icon={genderIcon} className='text-text-primary-inverse size-4' />
              ) : null}
            </div>
            {petSummary ? (
              <p className='body1-medium text-text-primary-inverse'>{petSummary}</p>
            ) : null}
            {guardianName ? (
              <div className='body1-medium text-text-primary-inverse flex items-center gap-1'>
                <span>{guardianName}</span>
                <span>{ownerDailyNoticeWriteContent.guardianLabel}</span>
              </div>
            ) : null}
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
                    disabled={isReadOnly}
                    onClick={() =>
                      setSelectedConditionId((current) =>
                        current === option.id ? null : option.id
                      )
                    }
                    className={`body2-semibold rounded-full border-[1.4px] px-3 py-2 ${
                      isSelected
                        ? 'border-line-accent bg-fill-primary-50 text-text-accent'
                        : 'border-line-200 bg-fill-secondary-0 text-text-primary'
                    } ${isReadOnly ? 'pointer-events-none' : ''}`}
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
              readOnly={isReadOnly}
            />
          </section>

          <section className='flex flex-col gap-4 px-4 py-4'>
            <div className='flex flex-col gap-2'>
              <h2 className='body2-bold text-text-primary'>
                {ownerDailyNoticeWriteContent.stoolSectionLabel}
              </h2>
              <div className='flex items-center justify-between'>
                {NOTICE_WRITE_STOOL_OPTIONS.map((option) => {
                  const isSelected = selectedStoolStatus === option.id;

                  return (
                    <button
                      key={option.id}
                      type='button'
                      aria-pressed={isSelected}
                      aria-label={option.label}
                      disabled={isReadOnly}
                      onClick={() =>
                        setSelectedStoolStatus((current) =>
                          current === option.id ? null : option.id
                        )
                      }
                      className={`flex flex-col items-center gap-2 ${isReadOnly ? 'pointer-events-none' : ''}`}
                    >
                      <div className='relative size-[58px] shrink-0 overflow-hidden rounded-lg'>
                        <Image
                          src={isSelected ? option.image : option.defaultImage}
                          alt=''
                          fill
                          className='object-contain'
                          sizes='58px'
                        />
                      </div>
                      <span
                        className={`caption1-semibold whitespace-nowrap text-center ${
                          isSelected ? 'text-text-accent' : 'text-text-tertiary'
                        }`}
                      >
                        {option.label}
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
              readOnly={isReadOnly}
            />
          </section>

          <section className='flex flex-col gap-2 px-4 py-4 pb-6'>
            <div className='flex items-center justify-between gap-2'>
              <h2 className='body2-bold text-text-primary'>
                {ownerDailyNoticeWriteContent.noticeSectionLabel}
              </h2>
              {!isReadOnly ? (
                <ActionButton
                  type='button'
                  variant='secondaryLine'
                  size='small'
                  className='caption2-semibold h-auto w-auto shrink-0 px-3 py-2'
                  onClick={handleLoadTemplateClick}
                >
                  {ownerDailyNoticeWriteContent.loadTemplateLabel}
                </ActionButton>
              ) : null}
            </div>
            <NoticeMemoTextarea
              value={notice}
              maxLength={ownerDailyNoticeWriteContent.noticeMaxLength}
              placeholder={ownerDailyNoticeWriteContent.noticePlaceholder}
              onChange={setNotice}
              readOnly={isReadOnly}
            />
          </section>
        </div>

        {!isReadOnly ? (
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
        ) : (
          <SafeArea edges={['bottom']} className='bg-bg-0 shrink-0' />
        )}
      </div>
    </div>
  );
}

export { OwnerDailyNoticeWritePage };
