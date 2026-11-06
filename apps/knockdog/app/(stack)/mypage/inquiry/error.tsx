'use client';

import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { PageError } from '@shared/ui/page-error';

/**
 * 문의 화면(목록·상세·작성·추가 작성)을 그리다 예상 못한 오류가 나면 먹통 대신 공통 오류 화면을 보여준다.
 * [다시 시도하기]는 페이지를 새로 불러온다. 캐시에 남은 잘못된 데이터로 같은 오류가 반복되지 않게 한다
 */
export default function InquiryError() {
  const { back } = useStackNavigation();

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={() => back()} />
      </Header>
      <PageError layout='inline' />
    </div>
  );
}
