import { cn } from '@knockdog/ui/lib';

import { TextHighlights } from '@shared/ui/text-highlights';

interface DogMetaLineProps {
  breed?: string | null;
  weightKg?: number | null;
  age?: number | null;
  searchKeyword?: string;
  className?: string;
  /** 프로필 헤더처럼 가운데 정렬 */
  centered?: boolean;
}

/** 견종은 말줄임, 몸무게·나이는 항상 노출 */
function DogMetaLine({
  breed,
  weightKg,
  age,
  searchKeyword = '',
  className,
  centered = false,
}: DogMetaLineProps) {
  const weightLabel = weightKg != null ? `${weightKg}kg` : null;
  const ageLabel = age != null ? `${age}살` : null;
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
        <span className='shrink-0 whitespace-nowrap'>
          {hasBreed ? ' · ' : null}
          {renderPart(weightLabel)}
        </span>
      ) : null}
      {ageLabel ? (
        <span className='shrink-0 whitespace-nowrap'>
          {hasBreed || weightLabel ? ' · ' : null}
          {renderPart(ageLabel)}
        </span>
      ) : null}
    </p>
  );
}

export { DogMetaLine };
export type { DogMetaLineProps };
