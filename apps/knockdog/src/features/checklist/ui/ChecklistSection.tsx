'use client';

import { ActionButton, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useParams } from 'next/navigation';
import { useStackNavigation } from '@shared/lib/bridge';
import { formatKstDateLabel, formatKstDayLabel, formatKstTimeLabel, getKstDateParts } from '@shared/lib/calendar-date';
import { getChecklistChip } from '@entities/checklist';
import { useUserStore } from '@entities/user/model/store/useUserStore';
import { useChecklistAnswersQuery } from '../api/useChecklistQuery';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { ChecklistMoreMenu } from './ChecklistMoreMenu';

interface CheckListSectionProps {
  kindergartenId?: string;
}

function parseChecklistWrittenAt(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatChecklistWrittenAt(value: string | null | undefined) {
  const date = parseChecklistWrittenAt(value);
  if (!date) return '';

  const { year } = getKstDateParts(date);
  const isCurrentYear = year === getKstDateParts(new Date()).year;
  const dateLabel = isCurrentYear ? formatKstDateLabel(date) : `${year}년 ${formatKstDateLabel(date)}`;

  return `${dateLabel} ${formatKstDayLabel(date)} ${formatKstTimeLabel(date)}`;
}

function CheckListSection({ kindergartenId }: CheckListSectionProps) {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const { push } = useStackNavigation();
  const isLoggedIn = useUserStore((state) => !!state.user);

  if (!id) throw new Error('Company ID is required for checklist section');

  const { data: checklist, isLoading, error } = useChecklistAnswersQuery(id ?? '', {
    enabled: isLoggedIn,
  });

  // @TODO: 화면 이동 경우 상수 이용할것
  const handleEditChecklist = () => push({ pathname: `/kindergarten/${id}/edit-checklist` });

  const answeredSections =
    checklist?.sections
      ?.map((section) => ({
        ...section,
        chips: section.answers.flatMap((answer) => {
          const chip = getChecklistChip(answer.questionId, answer.question, String(answer.value ?? ''));
          return chip ? [{ ...chip, key: answer.questionId }] : [];
        }),
        memos: section.answers.flatMap((answer) => {
          const memo = answer.memo?.trim() ?? '';
          return memo ? [{ key: answer.questionId, question: answer.question, memo }] : [];
        }),
      }))
      .filter((section) => section.chips.length > 0 || section.memos.length > 0) ?? [];
  const writtenAtLabel = formatChecklistWrittenAt(checklist?.updatedAt);
  // 체크리스트 미작성 시 API가 에러로 응답하는 경우도 빈 상태로 처리
  const isEmpty = !isLoading && (!!error || answeredSections.length === 0);

  const isFilled = !isLoading && !isEmpty;

  return (
    <div>
      <div className='flex items-center justify-between gap-1 py-3'>
        <div className='flex min-w-0 items-center gap-1'>
          <Icon icon='Checklist' className='text-text-accent size-6 shrink-0' />
          <span className='h3-extrabold'>체크리스트</span>
        </div>
        {isFilled && <ChecklistMoreMenu targetId={id} onEdit={handleEditChecklist} />}
      </div>
      {isLoading ? (
        <DelayedLoadingSpinner isLoading={isLoading} layout='inline' className='py-8' />
      ) : isEmpty ? (
        <>
          <p className='body1-medium text-text-tertiary py-4 text-center'>
            상담 중 확인할 내용을 체크리스트로 정리하세요
          </p>
          <div className='pb-4'>
            <ActionButton variant='secondaryLine' onClick={handleEditChecklist}>
              체크리스트 작성하기
            </ActionButton>
          </div>
        </>
      ) : (
        <>
          {writtenAtLabel ? <p className='body2-semibold text-text-secondary'>{writtenAtLabel}</p> : null}
          {answeredSections.map((section) => (
            <div key={section.sectionId} className='border-line-200 flex flex-col gap-3 border-b py-4'>
              <p className='body1-extrabold'>{section.title}</p>
              {section.chips.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {section.chips.map((chip) => (
                    <div
                      key={chip.key}
                      className={cn(
                        'label-medium rounded-lg px-2 py-[6px]',
                        chip.tone === 'yes' && 'border-line-accent text-primitive-orange-600 border bg-white',
                        chip.tone === 'no' && 'bg-fill-secondary-50 text-text-secondary'
                      )}
                    >
                      {chip.label}
                    </div>
                  ))}
                </div>
              ) : null}
              {section.memos.map((memo) => (
                <p key={memo.key} className='body2-regular text-text-secondary'>
                  {memo.question ? <span className='body2-bold text-text-primary'>{memo.question} </span> : null}
                  {memo.memo}
                </p>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export { CheckListSection };
