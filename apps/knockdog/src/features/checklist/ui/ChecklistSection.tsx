'use client';

import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useChecklistAnswersQuery } from '../api/useChecklistQuery';
import { useParams } from 'next/navigation';
import { useStackNavigation } from '@shared/lib/bridge';
import { QUESTION_MAP } from '@entities/checklist';

function CheckListSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { push } = useStackNavigation();

  if (!id) throw new Error('Company ID is required for checklist section');

  const { data: checklist = { sections: [] }, error, isLoading } = useChecklistAnswersQuery(id);

  return (
    <div>
      <div className='mb-2 flex justify-between gap-1 py-3'>
        <div className='flex items-center gap-1'>
          <Icon icon='Note' className='text-text-accent h-7 w-7' />
          <span className='h3-extrabold'>상담시 체크리스트</span>
        </div>
        {/* @TODO: 화면 이동 경우 상수 이용할것 */}
        <button onClick={() => push({ pathname: `/kindergarten/${id}/edit-checklist` })} className='text-text-tertiary flex items-center gap-1'>
          <span className='label-semibold'>편집</span>
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </button>
      </div>
      <div className='border-line-200 border-1 rounded-xl px-5 py-7'>
        {isLoading ? (
          <div className='text-text-secondary flex justify-center py-8'>
            <span className='body1-medium'>로딩 중...</span>
          </div>
        ) : error || !checklist?.sections || checklist?.sections.length === 0 ? (
          <div className='text-text-secondary flex justify-center py-8'>
            <span className='body1-medium'>{error?.message || '등록된 체크리스트가 없습니다'}</span>
          </div>
        ) : (
          checklist?.sections
            .filter(section => section.answers.length > 0)
            .map((section, index, filteredSections) => (
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
                        <span className='body2-semibold'>{QUESTION_MAP[answer.questionId as keyof typeof QUESTION_MAP] || answer.question}</span>
                      </div>
                    );
                  })}
                </div>
                {index < filteredSections.length - 1 && <Divider className='my-5' />}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export { CheckListSection };
