'use client';

import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useParams } from 'next/navigation';
import { useStackNavigation } from '@shared/lib/bridge';
import { QUESTION_MAP } from '@entities/checklist';
import { useUserStore } from '@entities/user/model/store/useUserStore';
import { useChecklistAnswersQuery } from '../api/useChecklistQuery';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

interface CheckListSectionProps {
  kindergartenId?: string;
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
        answers: section.answers.filter((answer) => answer.value != null && String(answer.value).trim() !== ''),
      }))
      .filter((section) => section.answers.length > 0) ?? [];
  // 체크리스트 미작성 시 API가 에러로 응답하는 경우도 빈 상태로 처리
  const isEmpty = !isLoading && (!!error || answeredSections.length === 0);

  return (
    <div>
      <div className='flex justify-between gap-1 py-3'>
        <div className='flex items-center gap-1'>
          <Icon icon='Checklist' className='text-text-accent h-6 w-6' />
          <span className='h3-extrabold'>체크리스트</span>
        </div>
        {!isEmpty && (
          <button onClick={handleEditChecklist} className='text-text-tertiary flex items-center gap-1'>
            <span className='label-semibold'>편집</span>
            <Icon icon='ChevronRight' className='h-4 w-4' />
          </button>
        )}
      </div>
      {isEmpty ? (
        <>
          <p className='body1-medium text-text-tertiary p-4 text-center'>상담 중 확인할 내용을 체크해 보세요</p>
          <div className='pb-4'>
            <ActionButton variant='secondaryLine' onClick={handleEditChecklist}>
              체크리스트 작성하기
            </ActionButton>
          </div>
        </>
      ) : (
        <div className='border-line-200 mt-2 rounded-xl border-1 px-5 py-7'>
          {isLoading ? (
            <DelayedLoadingSpinner isLoading={isLoading} layout='inline' className='py-8' />
          ) : (
            answeredSections.map((section, index) => (
              <div key={section.sectionId}>
                <div className='mb-3'>
                  <span className='body2-semibold'>{section.title}</span>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {section.answers.map((answer) => {
                    const isActive =
                      answer.value === 'YES' ||
                      (answer.question === '총원' && typeof answer.value === 'number' && answer.value >= 1);

                    return (
                      <div
                        key={answer.question}
                        className={cn(
                          'rounded-lg px-2 py-[6px]',
                          isActive && 'text-text-accent border-line-accent border',
                          !isActive && 'text-text-secondary bg-fill-secondary-50'
                        )}
                      >
                        <span className='body2-semibold'>
                          {QUESTION_MAP[answer.questionId as keyof typeof QUESTION_MAP] || answer.question}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {index < answeredSections.length - 1 && <Divider className='my-5' />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { CheckListSection };
