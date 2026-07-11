'use client';

import { useState } from 'react';

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
  RadioGroup,
  RadioGroupItem,
  Textarea,
  TextareaInput,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import {
  RELEASE_PERMISSION_REASON,
  releasePermissionContent,
  releasePermissionReasonOptions,
  type ReleasePermissionReason,
} from '@views/role-conversion/release-permission/config/releasePermissionContent';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function ReleasePermissionReasonPage() {
  const { push, replace } = useStackNavigation();
  const [selectedReason, setSelectedReason] = useState<ReleasePermissionReason | ''>('');
  const [etcReason, setEtcReason] = useState('');

  const isEtc = selectedReason === RELEASE_PERMISSION_REASON.ETC;
  const isNextEnabled = selectedReason !== '' && (!isEtc || etcReason.trim().length > 0);

  const handleNext = () => {
    if (!isNextEnabled) return;
    // @todo 선택 사유(selectedReason, etcReason) 전달/저장
    push({ pathname: route.roleConversion.releasePermission.verify.root });
  };

  const handleBackPress = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{releasePermissionContent.exitModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {releasePermissionContent.exitModalDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{releasePermissionContent.exitModalCancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                close();
                replace({ pathname: route.mypage.root });
              }}
            >
              {releasePermissionContent.exitModalConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton onClick={handleBackPress} />
        <Header.Title>{releasePermissionContent.headerTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5'>
        <h1 className='h1-extrabold text-text-primary'>{releasePermissionContent.reasonTitle}</h1>

        <RadioGroup
          className='mt-5 gap-0'
          value={selectedReason}
          onValueChange={(value) => setSelectedReason(value as ReleasePermissionReason)}
        >
          {releasePermissionReasonOptions.map((option) => (
            <div key={option.value} className='flex flex-col'>
              <RadioGroupItem value={option.value}>
                <div className='h3-medium py-4'>{option.label}</div>
              </RadioGroupItem>

              {option.value === RELEASE_PERMISSION_REASON.ETC && isEtc && (
                <div className='py-2'>
                  <Textarea
                    variant='default'
                    className='h-[100px]'
                    label={releasePermissionContent.reasonEtcLabel}
                    required
                  >
                    <TextareaInput
                      value={etcReason}
                      maxLength={releasePermissionContent.reasonEtcMaxLength}
                      placeholder={releasePermissionContent.reasonEtcPlaceholder}
                      onChange={(event) => setEtcReason(event.target.value)}
                    />
                  </Textarea>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className='shrink-0 px-4 py-5'>
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='w-full'
          disabled={!isNextEnabled}
          onClick={handleNext}
        >
          {releasePermissionContent.nextButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionReasonPage };
