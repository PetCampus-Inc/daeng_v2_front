'use client';

import { useState } from 'react';

import { ActionButton, IconButton, TextField, TextFieldInput } from '@knockdog/ui';

import { useOwnerKindergarten } from '@features/role-conversion';

import { releasePermissionContent } from '@views/role-conversion/release-permission/config/releasePermissionContent';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function ReleasePermissionVerifyPage() {
  const { push } = useStackNavigation();
  const { name } = useOwnerKindergarten();
  const [inputName, setInputName] = useState('');

  const isMatched = inputName.trim() === name.trim() && name.trim().length > 0;

  const handleRelease = () => {
    if (!isMatched) return;
    // @todo 원장 권한 해제 API 연동
    push({ pathname: route.roleConversion.releasePermission.complete.root });
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
          disabled={!isMatched}
          onClick={handleRelease}
        >
          {releasePermissionContent.releaseButtonLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { ReleasePermissionVerifyPage };
