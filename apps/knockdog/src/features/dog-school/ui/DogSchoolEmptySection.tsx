import { ActionButton } from '@knockdog/ui';

export function DogSchoolEmptySection() {
  return (
    <div className='flex h-full w-full items-center'>
      <div className='px-x4 py-x8 flex w-full flex-col items-center justify-center'>
        <div className='mb-[40px] text-center'>
          <p className='text-text-primary h3-semibold pb-x2'>
            검색 결과가 없어요
          </p>
          <p className='text-text-secondary body1-regular leading-relaxed'>
            똑독에 등록되지 않은 업체인가요? <br />
            우리 동네 강아지 유치원을 제보해 주세요!
          </p>
        </div>

        <ActionButton variant='secondaryFill' size='medium'>
          강아지 유치원 제보하기
        </ActionButton>
      </div>
    </div>
  );
}
