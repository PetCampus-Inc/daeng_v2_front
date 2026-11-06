import { kindergartenSearchContentInset } from '@views/role-conversion/kindergarten-search/config/kindergartenSearchContentInset';
import { cn } from '@knockdog/ui/lib';

function KindergartenSearchHint() {
  return (
    <ul
      className={cn(
        'text-text-tertiary body2-regular flex list-none flex-col gap-2 p-0',
        kindergartenSearchContentInset
      )}
    >
      <li className='flex gap-2'>
        <span aria-hidden className='shrink-0'>
          •
        </span>
        <span>
          시/군/구 + 도로명, 동명 또는 건물명 <br />
          예) 동해시 중앙로, 여수 중앙동, 대전 현대아파트
        </span>
      </li>
      <li className='flex gap-2'>
        <span aria-hidden className='shrink-0'>
          •
        </span>
        <span>도로명 + 건물번호 예) 종로 6</span>
      </li>
      <li className='flex gap-2'>
        <span aria-hidden className='shrink-0'>
          •
        </span>
        <span>읍/면/동/리 + 지번 예) 서린동 154-1</span>
      </li>
    </ul>
  );
}

export { KindergartenSearchHint };
