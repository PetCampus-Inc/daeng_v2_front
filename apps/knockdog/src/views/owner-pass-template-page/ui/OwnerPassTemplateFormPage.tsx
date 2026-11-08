'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
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
  IconButton,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
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
import { ActionLoadingOverlay, DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

type OwnerPassTemplateFormMode = 'create' | 'edit';
type DurationOption = PassTemplateDurationOption;

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
  durationOption: 'CUSTOM',
  customDuration: '',
  customUnit: 'DAY',
});

function durationOptionToInput(
  durationOption: DurationOption,
  customDuration: string,
  customUnit: PassTemplateDurationUnit
): OwnerPassTemplateInput['duration'] | null {
  if (durationOption === 'NONE') return { type: 'NONE' };
  if (durationOption === 'CUSTOM') {
    const value = parsePassTemplateValidity(customDuration);
    if (value === null) return null;
    return { type: 'FIXED', value, unit: customUnit };
  }

  return { type: 'FIXED', value: Number(durationOption.split('_')[0]), unit: 'MONTH' };
}

function selectionChipClassName(isSelected: boolean) {
  return cn(
    'radius-r2 body2-semibold h-12 shrink-0 px-4',
    isSelected ? 'bg-fill-secondary-700 text-text-primary-inverse' : 'bg-fill-secondary-50 text-text-primary'
  );
}

interface PassTemplateTextFieldProps extends ComponentProps<'input'> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  suffix?: ReactNode;
}

function PassTemplateTextField({
  label,
  required = false,
  errorMessage,
  suffix,
  ...inputProps
}: PassTemplateTextFieldProps) {
  return (
    <label className='flex min-w-0 flex-1 flex-col'>
      {label ? (
        <span className='body2-bold text-text-primary flex items-center gap-px pb-2'>
          {label}
          {required ? <span className='text-text-accent'>*</span> : null}
        </span>
      ) : null}
      <span
        className={cn(
          'radius-r2 bg-fill-secondary-0 focus-within:border-line-600 flex h-[52px] items-center gap-2 border px-4 transition-colors',
          errorMessage ? 'border-error' : 'border-line-200'
        )}
      >
        <input
          {...inputProps}
          aria-invalid={Boolean(errorMessage)}
          className='placeholder:text-text-tertiary text-text-primary caret-text-accent body1-regular h-full min-w-0 flex-1 bg-transparent py-3 outline-none'
        />
        {suffix ? <span className='body2-bold text-text-primary'>{suffix}</span> : null}
      </span>
      {errorMessage ? <span className='text-error body2-regular pt-2'>{errorMessage}</span> : null}
    </label>
  );
}

function OwnerPassTemplateFormPage({ mode }: OwnerPassTemplateFormPageProps) {
  const params = useParams<{ id?: string }>();
  const templateId = mode === 'edit' ? params?.id : undefined;
  const { back, replace } = useStackNavigation();
  const listQuery = useOwnerPassTemplatesQuery();
  const template = useMemo(
    () => (listQuery.data ? findPassTemplateById(listQuery.data, templateId) : null),
    [listQuery.data, templateId]
  );
  const { createMutation, updateMutation, deleteMutation } = useOwnerPassTemplateMutation();

  const [name, setName] = useState('');
  const [chargeCount, setChargeCount] = useState('');
  const [durationOption, setDurationOption] = useState<DurationOption>('CUSTOM');
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

  const isTemplateNotFound = mode === 'edit' && listQuery.isSuccess && !template;
  useEffect(() => {
    if (!isTemplateNotFound) return;
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
                try {
                  await deleteMutation.mutateAsync(templateId);
                  close();
                  toast({ title: '이용권을 삭제했어요', nativeTitle: '이용권을 삭제했어요', type: 'success' });
                  // 삭제 확인은 미저장 변경까지 버리는 명시적 결정이다. 모달 history가
                  // 정리된 다음 목록을 열어 overlay cleanup back과 경합하지 않게 한다.
                  requestAnimationFrame(() => {
                    void replace({ pathname: route.mypage.passTemplate.root });
                  });
                } catch {
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

      <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-4'>
        <div className='flex flex-col gap-6'>
          <PassTemplateTextField
            label={ownerPassTemplateContent.nameLabel}
            required
            errorMessage={duplicateNameError ? ownerPassTemplateContent.duplicateNameError : undefined}
            value={name}
            maxLength={PASS_TEMPLATE_NAME_MAX_LENGTH}
            placeholder={ownerPassTemplateContent.namePlaceholder}
            onChange={(event) => {
              setName(event.target.value);
              setDuplicateNameError(false);
            }}
          />

          <PassTemplateTextField
            label={ownerPassTemplateContent.chargeCountLabel}
            required
            errorMessage={showChargeCountError ? ownerPassTemplateContent.chargeCountError : undefined}
            suffix='회'
            value={chargeCount}
            inputMode='numeric'
            placeholder={ownerPassTemplateContent.chargeCountPlaceholder}
            onChange={(event) => setChargeCount(event.target.value)}
          />

          <fieldset>
            <legend className='body2-bold text-text-primary pb-2'>
              {ownerPassTemplateContent.durationLabel}
              <span className='text-text-accent'>*</span>
            </legend>
            <div className='flex flex-wrap gap-2'>
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  aria-pressed={durationOption === option.value}
                  className={selectionChipClassName(durationOption === option.value)}
                  onClick={() => setDurationOption(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {durationOption === 'CUSTOM' ? (
              <div className='mt-3 flex items-start gap-2'>
                <PassTemplateTextField
                  errorMessage={showDurationError ? ownerPassTemplateContent.durationError : undefined}
                  value={customDuration}
                  inputMode='numeric'
                  placeholder='1~99'
                  onChange={(event) => setCustomDuration(event.target.value)}
                />
                <div className='bg-fill-secondary-50 radius-r2 flex h-[52px] shrink-0 p-1'>
                  {(['DAY', 'MONTH'] as const).map((unit) => (
                    <button
                      key={unit}
                      type='button'
                      className={cn(
                        'radius-r1 body2-semibold min-w-14 px-3',
                        customUnit === unit ? 'bg-fill-secondary-0 text-text-primary shadow-sm' : 'text-text-secondary'
                      )}
                      onClick={() => setCustomUnit(unit)}
                    >
                      {unit === 'DAY' ? '일' : '개월'}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </fieldset>
        </div>
      </div>

      <div className='bg-bg-0 shrink-0 px-4 pt-5 pb-[calc(1.25rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'>
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

      <ActionLoadingOverlay isPending={isPending} />
    </div>
  );
}

export { OwnerPassTemplateFormPage };
export type { OwnerPassTemplateFormMode };
