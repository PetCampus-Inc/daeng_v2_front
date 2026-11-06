'use client';

import Image from 'next/image';

import { ActionButton } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';

/**
 * 아이디어 제안 완료 (PRD 7.6).
 * 작성 화면을 이 화면으로 바꿔 열므로 바로 아래가 마이페이지다. 뒤로가기와 [마이로 돌아가기]는 마이페이지로 간다
 */
function IdeaSuggestionCompletePage() {
  const { back } = useStackNavigation();

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.Title>아이디어 제안</Header.Title>
      </Header>

      <div className='gap-x7 flex min-h-0 flex-1 flex-col items-center justify-center'>
        <Image src='/images/img_mail_success.svg' alt='' width={200} height={200} priority />
        <div className='gap-x2 flex flex-col items-center text-center'>
          <h2 className='h1-extrabold text-text-primary'>아이디어를 접수했어요</h2>
          <p className='body1-medium text-text-primary'>소중한 의견을 보내주셔서 감사해요</p>
        </div>
      </div>

      <div className='bg-bg-0 p-x4 shrink-0'>
        <ActionButton type='button' size='large' onClick={() => back()}>
          마이로 돌아가기
        </ActionButton>
      </div>
    </div>
  );
}

export { IdeaSuggestionCompletePage };
