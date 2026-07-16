'use client';

import { useState } from 'react';

import { ActionButton, IconButton, TextField, TextFieldInput } from '@knockdog/ui';
import { useSearchParams } from 'next/navigation';

import { useOwnerKindergarten } from '@features/role-conversion';
import { useOwnerRoleRevokeMutation } from '@entities/user';
import { toast } from '@shared/ui/toast';

import {
  RELEASE_PERMISSION_SOURCE,
  RELEASE_PERMISSION_SOURCE_QUERY_KEY,
  releasePermissionContent,
} from '@views/role-conversion/release-permission/config/releasePermissionContent';
import {
  clearReleasePermissionReasonDraft,
  loadReleasePermissionReasonDraft,
  toRevokeOwnerRoleRequest,
} from '@views/role-conversion/release-permission/lib/releasePermissionReasonDraft';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function ReleasePermissionVerifyPage() {
  const { push, replace } = useStackNavigation();
  const searchParams = useSearchParams();
  const source = searchParams.get(RELEASE_PERMISSION_SOURCE_QUERY_KEY);
  const { name } = useOwnerKindergarten();
  const [inputName, setInputName] = useState('');
  const { mutateAsync: revokeOwnerRoleAsync, isPending } = useOwnerRoleRevokeMutation();

  const isMatched = inputName.trim() === name.trim() && name.trim().length > 0;

  const handleRelease = async () => {
    if (!isMatched || isPending) return;

    const draft = loadReleasePermissionReasonDraft();
    if (!draft) {
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        title: '해제 사유를 다시 선택해 주세요',
      });
      replace({
        pathname: route.roleConversion.releasePermission.reason.root,
        ...(source && { query: { [RELEASE_PERMISSION_SOURCE_QUERY_KEY]: source } }),
      });
      return;
    }

    try {
      await revokeOwnerRoleAsync(toRevokeOwnerRoleRequest(draft));
      clearReleasePermissionReasonDraft();

      if (source === RELEASE_PERMISSION_SOURCE.WITHDRAW) {
        push({ pathname: route.roleConversion.releasePermission.withdraw.root });
        return;
      }

      push({ pathname: route.roleConversion.releasePermission.complete.root });
    } catch (error) {
      console.error('[owner role revoke]', error);
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        title: '권한 해제에 실패했어요',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{releasePermissionContent.headerTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5'>
        <h1 className='h1-extrabold text-text-primary'>
          {releasePermissionContent.verifyTitleLine1}
          <br />
          {releasePermissionContent.verifyTitleLine2}
        </h1>

        <div className='flex flex-col gap-2'>
          <p className='h3-extrabold text-text-primary py-2'>{name}</p>

          <TextField
            className='h-x13'
            suffix={
              inputName ? (
                <IconButton
                  type='button'
                  icon='DeleteInput'
                  onClick={() => setInputName('')}
                  aria-label='입력 삭제'
                />
              ) : undefined
            }
          >
            <TextFieldInput
              placeholder={releasePermissionContent.verifyInputPlaceholder}
              value={inputName}
              onChange={(event) => setInputName(event.target.value)}
            />
          </TextField>
        </div>
      </div>

      <div className='shrink-0 px-4 py-5'>
        <ActionButton
          type='button'
          variant='secondaryFill'
          size='large'
          className='w-full'
          disabled={!isMatched || isPending}
          onClick={handleRelease}
        >
          {releasePermissionContent.releaseButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionVerifyPage };
