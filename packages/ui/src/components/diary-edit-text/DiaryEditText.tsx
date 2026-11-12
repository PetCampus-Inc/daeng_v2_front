import { type SVGProps } from 'react';

import { cn } from '@knockdog/ui/lib';

const DEFAULT_BODY =
  '오늘은 누나가 아침 일찍 유치원에 데려다줬어! 운동장에서 보더콜리 친구랑 공놀이를 했는데, 내가 공을 세 번이나 먼저 잡았지. 점심은 하나도 안 남기고 다 먹었어. 낮잠 시간엔 너무 졸려서 금방 잠들었어.\n\n집에 와서는 누나랑 공원에 가서 낙엽을 밟았는데, 바스락 소리가 너무 재밌었어. 내일도 이렇게 신나는 하루였으면 좋겠다!';

interface DiaryEditTextProps {
  body?: string;
  isEditing?: boolean;
  className?: string;
  onEdit?: () => void;
  onBodyChange?: (body: string) => void;
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M7.58333 12.25H12.25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M12.3515 3.97367C12.6599 3.66533 12.8332 3.24711 12.8333 2.811C12.8333 2.37489 12.6601 1.95662 12.3518 1.64821C12.0435 1.33979 11.6252 1.1665 11.1891 1.16644C10.753 1.16639 10.3347 1.33958 10.0263 1.64792L2.24117 9.43483C2.10573 9.56987 2.00557 9.73614 1.9495 9.919L1.17892 12.4577C1.16384 12.5081 1.1627 12.5617 1.17562 12.6127C1.18854 12.6638 1.21504 12.7104 1.2523 12.7476C1.28956 12.7848 1.3362 12.8112 1.38726 12.824C1.43832 12.8369 1.49191 12.8357 1.54233 12.8205L4.08158 12.0505C4.26427 11.9949 4.43052 11.8954 4.56575 11.7606L12.3515 3.97367Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Dog Diary / Edit Texts */
function DiaryEditText({ body = DEFAULT_BODY, isEditing = false, className, onEdit, onBodyChange }: DiaryEditTextProps) {
  const boxClass = cn(
    'body1-regular text-text-primary radius-r2 min-h-[234px] w-full whitespace-pre-line px-x4 py-x4',
    isEditing ? 'border-line-accent bg-bg-0 border outline-none' : 'bg-bg-50'
  );

  return (
    <div className={cn('flex w-full flex-col', className)}>
      {isEditing && onBodyChange ? (
        <textarea autoFocus value={body} onChange={(event) => onBodyChange(event.target.value)} className={cn(boxClass, 'resize-none')} />
      ) : (
        <div className={boxClass}>{body}</div>
      )}
      {isEditing ? null : (
        <button type='button' onClick={onEdit} className='body2-semibold text-fill-secondary-500 gap-x2 px-x1 py-x3 flex items-center justify-end'>
          <PencilIcon />
          직접 수정
        </button>
      )}
    </div>
  );
}

export { DiaryEditText };
export type { DiaryEditTextProps };
