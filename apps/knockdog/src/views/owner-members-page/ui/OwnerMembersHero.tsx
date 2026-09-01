import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  ownerMembersContent,
} from '@views/owner-members-page/config/ownerMembersContent';
import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useFocusScrollLock } from '@shared/lib/device';

interface OwnerMembersHeroProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

function OwnerMembersHero({ searchQuery, onSearchQueryChange }: OwnerMembersHeroProps) {
  const { push } = useStackNavigation();
  const { fieldRef, handleFocus, handleBlur, handlePointerDown } = useFocusScrollLock<HTMLInputElement>();

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
          <button
            type='button'
            className='body2-semibold text-text-primary-inverse h-x7 radius-r1'
            onClick={() => push({ pathname: route.owner.members.approval.root })}
          >
            연결 승인
          </button>
        </Header.RightSection>
      </Header>

      <div className='px-x4 py-x2 relative z-10 flex h-16 items-center'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='bg-bg-0 h-x12 border-0'
        >
          <TextFieldInput
            ref={fieldRef}
            type='search'
            inputMode='search'
            value={searchQuery}
            maxLength={OWNER_MEMBER_SEARCH_MAX_LENGTH}
            placeholder={ownerMembersContent.searchPlaceholder}
            aria-label='구성원 검색어 입력'
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onPointerDown={handlePointerDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {searchQuery && (
            <button
              type='button'
              onMouseDown={(event) => {
                event.preventDefault();
                onSearchQueryChange('');
              }}
              aria-label='검색어 초기화'
              className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
            >
              <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
            </button>
          )}
        </TextField>
      </div>
    </div>
  );
}

export { OwnerMembersHero };
