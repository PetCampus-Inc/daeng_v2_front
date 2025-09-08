'use client';

import { Divider, Icon } from '@knockdog/ui';
import Link from 'next/link';
import { cn } from '@knockdog/ui/lib';
import { useChecklistAnswersQuery } from '../api/useChecklistQuery';
import { useParams } from 'next/navigation';

function CheckListSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for checklist section');

  //@TODO: API 완성 후 수정 필요
  // const { data: checklist } = useChecklistAnswersQuery(id);

  const mockData = {
    sections: [
      {
        sectionId: '1',
        title: '등록요건',
        answers: [
          { question: '백신 접종 증명서', value: 'YES' },
          { question: '중성화', value: 'UNKNOWN' },
          { question: '견종/체형 등록', value: 'NO' },
        ],
      },
      {
        sectionId: '2',
        title: '강아지 맞춤 관리',
        answers: [
          { question: '분반', value: 'YES' },
          { question: '성향 진단', value: 'NO' },
          { question: '맞춤 일정', value: 'NO' },
          { question: '총원', value: 24 },
        ],
      },
      {
        sectionId: '3',
        title: '식사 및 프로그램',
        answers: [
          { question: '맞춤 배급', value: 'YES' },
          { question: '커리큘럼', value: 'YES' },
        ],
      },
      {
        sectionId: '4',
        title: '안전 관리',
        answers: [
          { question: '인근 동물병원', value: 'YES' },
          { question: '안전한 사고대응 관리', value: 'YES' },
        ],
      },
      {
        sectionId: '5',
        title: '이용 정책',
        answers: [
          { question: '1일 체험', value: 'YES' },
          { question: '적절한 환불 규정', value: 'YES' },
        ],
      },
    ],
  };

  return (
    <div>
      <div className='mb-2 flex justify-between gap-1 py-3'>
        <div className='flex items-center gap-1'>
          <Icon icon='Note' className='text-text-accent h-7 w-7' />
          <span className='h3-extrabold'>상담시 체크리스트</span>
        </div>
        {/* @TODO: 화면 이동 경우 상수 이용할것 */}
        <Link href={`/company/hi/edit-checklist`} className='text-text-tertiary flex items-center gap-1'>
          <span className='label-semibold'>편집</span>
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </Link>
      </div>
      <div className='border-line-200 border-1 rounded-xl px-5 py-7'>
        {mockData.sections.map((section, index) => (
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
                    <span className='body2-semibold'>{answer.question}</span>
                  </div>
                );
              })}
            </div>
            {index < mockData.sections.length - 1 && <Divider className='my-5' />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { CheckListSection };
