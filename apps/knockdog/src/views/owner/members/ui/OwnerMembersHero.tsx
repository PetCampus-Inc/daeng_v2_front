import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { Header } from '@widgets/Header';

function OwnerMembersHero() {
  return (
    <div className='relative overflow-hidden pt-(--safe-area-inset-top,0px) pb-6'>
      <Icon
        icon='Paw'
        aria-hidden='true'
        className='text-primitive-orange-300 pointer-events-none absolute top-[2px] -left-[86px] size-[240px] rotate-[30deg] opacity-20'
      />

      <Header variant='transparent'>
        <Header.Title className='text-text-primary-inverse'>구성원</Header.Title>
        <Header.RightSection>
          <button type='button' className='body2-semibold text-text-primary-inverse h-x7 radius-r1'>
            연결 승인
          </button>
        </Header.RightSection>
      </Header>

      <div className='px-x4 py-x2 relative z-10 flex h-16 items-center'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='bg-bg-0 h-x12 border-0'
        >
          <TextFieldInput type='search' placeholder='강아지 이름을 검색해요' aria-label='구성원 검색어 입력' />
        </TextField>
      </div>
    </div>
  );
}

export { OwnerMembersHero };
