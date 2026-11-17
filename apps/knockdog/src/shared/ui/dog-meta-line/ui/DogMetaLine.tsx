import { Fragment } from 'react';

import { cn } from '@knockdog/ui/lib';

import { getDogMetaParts } from '@shared/ui/dog-meta-line/lib/getDogMetaParts';
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
  const parts = getDogMetaParts({ breed, weightKg, birthYear });
  const hasBreed = Boolean(breed?.trim());
  const keyword = searchKeyword.trim();

  if (parts.length === 0) return null;

  const renderPart = (text: string) => (keyword ? TextHighlights(text, keyword) : text);

  return (
    <p
      className={cn(
        'm-0 flex min-w-0 w-full items-center',
        centered && 'justify-center',
        className
      )}
    >
      {parts.map((text, index) => {
        const isBreed = hasBreed && index === 0;

        return (
          <Fragment key={`${index}-${text}`}>
            {index > 0 ? (
              <span aria-hidden className='shrink-0 mx-0.5'>
                ·
              </span>
            ) : null}
            <span className={isBreed ? 'min-w-0 truncate' : 'shrink-0 whitespace-nowrap'}>
              {renderPart(text)}
            </span>
          </Fragment>
        );
      })}
    </p>
  );
}

export { DogMetaLine };
export type { DogMetaLineProps };
