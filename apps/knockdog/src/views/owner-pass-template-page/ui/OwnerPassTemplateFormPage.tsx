'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
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
  CustomDurationChip,
  DurationChip,
  DurationUnitField,
  FormField,
  IconButton,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { ownerPassTemplateContent } from '@views/owner-pass-template-page/config/ownerPassTemplateContent';
import { Header } from '@widgets/Header';
import {
  PASS_TEMPLATE_DUPLICATE_CODE,
  PASS_TEMPLATE_NAME_MAX_LENGTH,
  findPassTemplateById,
  getPassTemplateSelection,
  isValidPassTemplateInput,
  parsePassTemplateChargeCount,
  parsePassTemplateValidity,
  type OwnerPassTemplateInput,
  type PassTemplateDurationOption,
  type PassTemplateDurationUnit,
  useOwnerPassTemplateMutation,
  useOwnerPassTemplatesQuery,
} from '@entities/owner-pass-template';

import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { ACTION_SPINNER_DELAY_MS, ActionLoadingOverlay, DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

type OwnerPassTemplateFormMode = 'create' | 'edit';
type DurationOption = PassTemplateDurationOption;
/** 처음 들어온 등록 화면은 아무 칩도 고르지 않은 null 상태다. */
type DurationSelection = DurationOption | null;

interface OwnerPassTemplateFormPageProps {
  mode: OwnerPassTemplateFormMode;
}

const DURATION_OPTIONS: { value: DurationOption; label: string }[] = [
  { value: 'NONE', label: '만료 없음' },
  { value: '1_MONTH', label: '1개월' },
  { value: '3_MONTH', label: '3개월' },
  { value: '6_MONTH', label: '6개월' },
  { value: '12_MONTH', label: '12개월' },
  { value: 'CUSTOM', label: '직접 입력' },
];

const CREATE_INITIAL_SIGNATURE = JSON.stringify({
  name: '',
  chargeCount: '',
  durationOption: null,
  customDuration: '',
  customUnit: 'DAY',
});

function durationOptionToInput(
  durationOption: DurationSelection,
  customDuration: string,
  customUnit: PassTemplateDurationUnit
): OwnerPassTemplateInput['duration'] | null {
  if (durationOption === null) return null;
  if (durationOption === 'NONE') return { type: 'NONE' };
  if (durationOption === 'CUSTOM') {
    const value = parsePassTemplateValidity(customDuration);
    if (value === null) return null;
    return { type: 'FIXED', value, unit: customUnit };
  }

  return { type: 'FIXED', value: Number(durationOption.split('_')[0]), unit: 'MONTH' };
}

/** 필수 항목 라벨. Figma의 라벨 옆 `*` 표시를 붙인다. */
function requiredLabel(label: ReactNode) {
  return (
    <>
      {label}
      <span className='text-text-accent'>*</span>
    </>
  );
}

function OwnerPassTemplateFormPage({ mode }: OwnerPassTemplateFormPageProps) {
  const params = useParams<{ id?: string }>();
  const templateId = mode === 'edit' ? params?.id : undefined;
  const { back, replace } = useStackNavigation();
  const listQuery = useOwnerPassTemplatesQuery({ enabled: mode === 'edit' });
  const template = useMemo(
    () => (listQuery.data ? findPassTemplateById(listQuery.data, templateId) : null),
    [listQuery.data, templateId]
  );
  const { createMutation, updateMutation, deleteMutation } = useOwnerPassTemplateMutation();

  const [name, setName] = useState('');
  const [chargeCount, setChargeCount] = useState('');
  const [durationOption, setDurationOption] = useState<DurationSelection>(null);
  const [customDuration, setCustomDuration] = useState('');
  const [customUnit, setCustomUnit] = useState<PassTemplateDurationUnit>('DAY');
  const [duplicateNameError, setDuplicateNameError] = useState(false);
  const [initialSignature, setInitialSignature] = useState(mode === 'create' ? CREATE_INITIAL_SIGNATURE : '');
  const initializedTemplateIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!template || initializedTemplateIdRef.current === template.id) return;

    const selection = getPassTemplateSelection(template.duration);
    const nextForm = {
      name: template.name,
      chargeCount: String(template.chargeCount),
      durationOption: selection.option,
      customDuration: selection.customValue,
      customUnit: selection.customUnit,
    };
    setName(nextForm.name);
    setChargeCount(nextForm.chargeCount);
    setDurationOption(nextForm.durationOption);
    setCustomDuration(nextForm.customDuration);
    setCustomUnit(nextForm.customUnit);
    setInitialSignature(JSON.stringify(nextForm));
    initializedTemplateIdRef.current = template.id;
  }, [template]);

  // 삭제를 시작했으면 목록이 갱신돼 항목이 사라져도 `찾을 수 없음`으로 처리하지 않는다.
  const isDeletingRef = useRef(false);
  const isTemplateNotFound = mode === 'edit' && listQuery.isSuccess && !template;
  useEffect(() => {
    if (!isTemplateNotFound || isDeletingRef.current) return;
    toast({ title: '이용권을 찾을 수 없어요', nativeTitle: '이용권을 찾을 수 없어요' });
    void replace({ pathname: route.mypage.passTemplate.root });
  }, [isTemplateNotFound, replace]);

  const currentSignature = JSON.stringify({
    name,
    chargeCount,
    durationOption,
    customDuration,
    customUnit,
  });
  const isReady = mode === 'create' || Boolean(template && initialSignature);
  const isDirty = isReady && currentSignature !== initialSignature;
  const parsedChargeCount = parsePassTemplateChargeCount(chargeCount);
  const duration = durationOptionToInput(durationOption, customDuration, customUnit);
  const input = useMemo<OwnerPassTemplateInput | null>(() => {
    if (parsedChargeCount === null || duration === null) return null;
    return { name, chargeCount: parsedChargeCount, duration };
  }, [duration, name, parsedChargeCount]);
  const isValid = Boolean(input && isValidPassTemplateInput(input));
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const canSubmit = isValid && !duplicateNameError && !isPending && (mode === 'create' || isDirty);
  const showChargeCountError = chargeCount.length > 0 && parsedChargeCount === null;
  const showDurationError = durationOption === 'CUSTOM' && customDuration.length > 0 && duration === null;

  const handleBackRef = useRef(() => {});
  const { releaseAndLeave } = useUnsavedBrowserBackGuard(isDirty, () => handleBackRef.current());
  const leavePage = useCallback(() => {
    releaseAndLeave(() => {
      void back();
    });
  }, [back, releaseAndLeave]);

  const handleBack = useCallback(() => {
    if (isPending) return;
    if (!isDirty) {
      leavePage();
      return;
    }

    openUnsavedExitDialog({
      title: ownerPassTemplateContent.unsavedTitle,
      description: ownerPassTemplateContent.unsavedDescription,
      cancelLabel: '닫기',
      confirmLabel: '나가기',
      onConfirm: leavePage,
    });
  }, [isDirty, isPending, leavePage]);

  useLayoutEffect(() => {
    handleBackRef.current = handleBack;
  }, [handleBack]);
  useNativeBackHandler(handleBack);

  const moveToList = useCallback(() => {
    const navigate = () => {
      void replace({ pathname: route.mypage.passTemplate.root });
    };

    if (isDirty) {
      releaseAndLeave(navigate);
      return;
    }

    navigate();
  }, [isDirty, releaseAndLeave, replace]);

  const handleSubmit = async () => {
    if (!canSubmit || !input) return;

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(input);
        toast({ title: '이용권이 등록됐어요', nativeTitle: '이용권이 등록됐어요', type: 'success' });
      } else if (templateId) {
        await updateMutation.mutateAsync({ id: templateId, input });
        toast({ title: '이용권을 저장했어요', nativeTitle: '이용권을 저장했어요', type: 'success' });
      }
      moveToList();
    } catch (error) {
      if (error instanceof ApiError && error.code === PASS_TEMPLATE_DUPLICATE_CODE) {
        setDuplicateNameError(true);
        return;
      }

      const message = mode === 'create' ? '이용권을 등록하지 못했어요' : '이용권을 저장하지 못했어요';
      toast({ title: message, nativeTitle: message });
    }
  };

  const openDeleteDialog = () => {
    if (!templateId || isPending) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerPassTemplateContent.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{ownerPassTemplateContent.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault();
                if (isDeletingRef.current) return;
                isDeletingRef.current = true;
                try {
                  await deleteMutation.mutateAsync(templateId);
                  // 삭제 확인은 미저장 변경까지 버리는 명시적 결정이다. 모달을 닫을 때 앱이
                  // history.back()을 실행하므로, 그 popstate가 끝난 뒤에 목록으로 이동해
                  // 이동이 뒤로가기에 덮어씌워지지 않게 한다. 신호가 없으면 300ms 뒤 이동한다.
                  let didNavigate = false;
                  const goToList = () => {
                    if (didNavigate) return;
                    didNavigate = true;
                    window.removeEventListener('popstate', goToList);
                    // 수정 중이면 이탈 방지용 history 칸이 하나 더 있어, 먼저 풀고 이동한다.
                    releaseAndLeave(() => {
                      void replace({ pathname: route.mypage.passTemplate.root });
                    });
                  };
                  window.addEventListener('popstate', goToList);
                  close();
                  toast({ title: '이용권을 삭제했어요', nativeTitle: '이용권을 삭제했어요', type: 'success' });
                  window.setTimeout(goToList, 300);
                } catch {
                  isDeletingRef.current = false;
                  close();
                  toast({ title: '이용권을 삭제하지 못했어요', nativeTitle: '이용권을 삭제하지 못했어요' });
                }
              }}
            >
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  if (mode === 'edit' && listQuery.isError) {
    return (
      <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>{ownerPassTemplateContent.managementTitle}</Header.Title>
        </Header>
        <PageError
          layout='inline'
          isRetrying={listQuery.isFetching}
          onRetry={() => {
            void listQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (mode === 'edit' && !template) {
    return <DelayedLoadingSpinner isLoading layout='content' />;
  }

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header className='h-[66px] shrink-0' innerClassName='h-[66px]'>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title className='max-w-[220px] truncate'>
          {mode === 'edit' ? template?.name : ownerPassTemplateContent.managementTitle}
        </Header.Title>
        {mode === 'edit' ? (
          <Header.RightSection>
            <IconButton
              type='button'
              icon='Trash'
              iconClassName='text-text-secondary size-6'
              aria-label='이용권 삭제'
              onClick={openDeleteDialog}
            />
          </Header.RightSection>
        ) : null}
      </Header>

      {/* Figma: 헤더 아래 간격 16 + 각 항목 위 여백 20 = 36, 항목 사이도 16 + 20 = 36 */}
      <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-9 pb-4'>
        <div className='flex flex-col gap-9'>
          <FormField
            label={requiredLabel(ownerPassTemplateContent.nameLabel)}
            aria-label={ownerPassTemplateContent.nameLabel}
            aria-invalid={duplicateNameError}
            state={duplicateNameError ? 'error' : name ? 'filled' : 'default'}
            errorMessage={ownerPassTemplateContent.duplicateNameError}
            trailing={`${name.length}/${PASS_TEMPLATE_NAME_MAX_LENGTH}`}
            value={name}
            maxLength={PASS_TEMPLATE_NAME_MAX_LENGTH}
            placeholder={ownerPassTemplateContent.namePlaceholder}
            onChange={(event) => {
              setName(event.target.value);
              setDuplicateNameError(false);
            }}
          />

          <FormField
            label={requiredLabel(ownerPassTemplateContent.chargeCountLabel)}
            aria-label={ownerPassTemplateContent.chargeCountLabel}
            aria-invalid={showChargeCountError}
            state={showChargeCountError ? 'error' : chargeCount ? 'filled' : 'default'}
            errorMessage={ownerPassTemplateContent.chargeCountError}
            trailing='회'
            trailingSize='body'
            value={chargeCount}
            inputMode='numeric'
            placeholder={ownerPassTemplateContent.chargeCountPlaceholder}
            onChange={(event) => setChargeCount(event.target.value)}
          />

          <div role='group' aria-labelledby='pass-template-duration-label' className='flex min-w-0 flex-col gap-4'>
            <p id='pass-template-duration-label' className='label-medium text-text-secondary px-x1'>
              {requiredLabel(ownerPassTemplateContent.durationLabel)}
            </p>
            <div className='flex flex-wrap gap-x-1 gap-y-3'>
              {DURATION_OPTIONS.map((option) =>
                option.value === 'CUSTOM' ? (
                  <CustomDurationChip
                    key={option.value}
                    selected={durationOption === option.value}
                    onClick={() => setDurationOption(option.value)}
                  >
                    {option.label}
                  </CustomDurationChip>
                ) : (
                  <DurationChip
                    key={option.value}
                    selected={durationOption === option.value}
                    onClick={() => setDurationOption(option.value)}
                  >
                    {option.label}
                  </DurationChip>
                )
              )}
            </div>

            {durationOption === 'CUSTOM' ? (
              <div className='flex flex-col gap-x2'>
                <DurationUnitField
                  className='pr-[2px] pl-x1'
                  unit={customUnit === 'DAY' ? 'day' : 'month'}
                  onUnitChange={(unit) => setCustomUnit(unit === 'day' ? 'DAY' : 'MONTH')}
                  value={customDuration}
                  aria-invalid={showDurationError}
                  placeholder='1~99'
                  onChange={(event) => setCustomDuration(event.target.value)}
                />
                {showDurationError ? (
                  <p className='caption1-regular text-error px-x2'>{ownerPassTemplateContent.durationError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className='bg-bg-0 shrink-0 px-4 pt-4 pb-[calc(1rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'>
        <ActionButton
          type='button'
          size='large'
          variant='primaryFill'
          disabled={!canSubmit}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {ownerPassTemplateContent.submitButtonLabel}
        </ActionButton>
      </div>

      <ActionLoadingOverlay isPending={isPending} delayMs={ACTION_SPINNER_DELAY_MS} />
    </div>
  );
}

export { OwnerPassTemplateFormPage };
export type { OwnerPassTemplateFormMode };
