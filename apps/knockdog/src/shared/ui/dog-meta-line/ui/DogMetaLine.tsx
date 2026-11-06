import { cn } from '@knockdog/ui/lib';

import { formatAge } from '@entities/pet';
import { TextHighlights } from '@shared/ui/text-highlights';

interface DogMetaLineProps {
  breed?: string | null;
  weightKg?: number | null;
  birthYear?: number | null;
  searchKeyword?: string;
  className?: string;
  /** 프로필 헤더처럼 가운데 정렬 */
  centered?: boolean;
}

/** 견종은 말줄임, 몸무게·나이는 항상 노출 */
function DogMetaLine({
  breed,
  weightKg,
  birthYear,
  searchKeyword = '',
  className,
  centered = false,
}: DogMetaLineProps) {
  const weightLabel = weightKg != null ? `${weightKg}kg` : null;
  const ageLabel = formatAge(birthYear) || null;
  const hasBreed = Boolean(breed?.trim());
  const keyword = searchKeyword.trim();

  if (!hasBreed && !weightLabel && !ageLabel) return null;

  const renderPart = (text: string) => (keyword ? TextHighlights(text, keyword) : text);

  return (
    <p
      className={cn(
        'm-0 flex min-w-0 w-full items-center',
        centered && 'justify-center',
        className
      )}
    >
      {hasBreed ? <span className='min-w-0 truncate'>{renderPart(breed!.trim())}</span> : null}
      {weightLabel ? (
        <>
          {hasBreed ? <span aria-hidden className='shrink-0 mx-0.5'>·</span> : null}
          <span className='shrink-0 whitespace-nowrap'>{renderPart(weightLabel)}</span>
        </>
      ) : null}
      {ageLabel ? (
        <>
          {hasBreed || weightLabel ? <span aria-hidden className='shrink-0 mx-0.5'>·</span> : null}
          <span className='shrink-0 whitespace-nowrap'>{renderPart(ageLabel)}</span>
        </>
      ) : null}
    </p>
  );
}

export { DogMetaLine };
export type { DogMetaLineProps };
