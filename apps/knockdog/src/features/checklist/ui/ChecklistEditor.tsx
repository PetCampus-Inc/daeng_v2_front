'use client';

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem, TextField, TextFieldInput, Divider } from '@knockdog/ui';
import { QuestionAnswers, vaccinationOptions, ChecklistEditApi } from '@features/dog-school';
import { useChecklistQuestionsQuery } from '../api/useChecklistQuery';
import { AnswerGroup } from '@entities/checklist';

interface ChecklistEditorProps {
  isEditing: boolean;
  initialAnswers?: AnswerGroup[];
  onSave: (answers: AnswerGroup[]) => void;
}

export const mockAnswers = [
  {
    sectionId: 'sec_register',
    title: '등록요건',
    answers: [
      { questionId: 'q_vaccine_proof_required', question: '어쩌구', value: 'YES' },
      { questionId: 'q_neutered_required', question: '저쩌구', value: 'NO' },
      { questionId: 'q_mixed_size_allowed', question: '이렇게 저렇게', value: 'UNKNOWN' },
    ],
  },
  {
    sectionId: 'sec_temper',
    title: '강아지 맞춤 관리',
    answers: [
      { questionId: 'q_manage_by_temper', question: '어쩌구', value: 'YES' },
      { questionId: 'q_evaluate_temper', question: '저쩌구', value: 'NO' },
      { questionId: 'q_schedule_by_temper', question: '이렇게 저렇게', value: 'UNKNOWN' },
    ],
  },
  {
    sectionId: 'sec_meal',
    title: '식사 및 프로그램',
    answers: [
      { questionId: 'q_personalized_meal', question: '어쩌구', value: 'YES' },
      { questionId: 'q_curriculum_timeblock', question: '저쩌구', value: 'NO' },
    ],
  },
  {
    sectionId: 'sec_safety',
    title: '안전 관리',
    answers: [
      { questionId: 'q_nearby_vet', question: '어쩌구', value: 'YES' },
      { questionId: 'q_accident_protocol', question: '저쩌구', value: 'NO' },
    ],
  },
  {
    sectionId: 'sec_policy',
    title: '이용 정책',
    answers: [
      { questionId: 'q_trial_day_available', question: '어쩌구', value: 'YES' },
      { questionId: 'q_refund_rules_clear', question: '저쩌구', value: 'NO' },
    ],
  },
];

export const mockChecklistData = {
  sections: [
    {
      id: 'sec_register',
      title: '등록요건',
      questions: [
        {
          id: 'q_vaccine_proof_required',
          label: '백신 접종증명서를 제출해야 하나요?',
          type: 'TRI_STATE',
        },
        { id: 'q_neutered_required', label: '중성화가 필요한가요?', type: 'TRI_STATE' },
        { id: 'q_mixed_size_allowed', label: '우리 아이 견종/체형이 등록 가능한가요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_temper',
      title: '강아지 성향 관리',
      questions: [
        { id: 'q_manage_by_temper', label: '견종/체형별로 분반해 관리해 주시나요?', type: 'TRI_STATE' },
        { id: 'q_evaluate_temper', label: '강아지 성향을 진단해 주시나요?', type: 'TRI_STATE' },
        { id: 'q_schedule_by_temper', label: '일과표가 강아지 성향에 따라 조정되나요?', type: 'TRI_STATE' },
        {
          id: 'q_max_dogs_per_day',
          label: '하루에 총 몇 마리까지 등록하나요?',
          type: 'INTEGER',
          validation: { min: 0, max: 500 },
        },
      ],
    },
    {
      id: 'sec_meal',
      title: '식사 및 프로그램',
      questions: [
        { id: 'q_personalized_meal', label: '사료 및 식사량 맞춤 배급이 가능한가요?', type: 'TRI_STATE' },
        { id: 'q_curriculum_timeblock', label: '하루 일과가 정해진 커리큘럼에 따라 운영하나요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_safety',
      title: '안전 관리',
      questions: [
        { id: 'q_nearby_vet', label: '근처에 동물병원이 있나요?', type: 'TRI_STATE' },
        { id: 'q_accident_protocol', label: '사고 발생 시 대응 규정이 충분히 마련되어 있나요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_policy',
      title: '이용 정책',
      questions: [
        { id: 'q_trial_day_available', label: '1일 체험 등록이 가능한가요?', type: 'TRI_STATE' },
        { id: 'q_refund_rules_clear', label: '환불 및 결제 취소 규정이 명확히 정해져 있나요?', type: 'TRI_STATE' },
      ],
    },
  ],
};

function ChecklistEditor({ isEditing, initialAnswers, onSave }: ChecklistEditorProps) {
  const [answers, setAnswers] = useState<AnswerGroup[]>(initialAnswers || mockAnswers);
  const { data: questions } = useChecklistQuestionsQuery();

  // 초기 답변이 변경될 때 상태 업데이트
  useEffect(() => {
    if (initialAnswers) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  // answerId와 questionId를 매칭하는 함수
  const findAnswerForQuestion = (questionId: string) => {
    for (const answerGroup of answers) {
      const answer = answerGroup.answers.find((answer) => answer.questionId === questionId);
      if (answer) return answer;
    }
    return null;
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => {
      return prevAnswers.map((answerGroup) => {
        return {
          ...answerGroup,
          answers: answerGroup.answers.map((answer) =>
            answer.questionId === questionId ? { ...answer, value } : answer
          ),
        };
      });
    });
  };

  const handleSave = () => {
    onSave(answers);
  };

  // 편집 모드가 변경될 때 저장 함수 호출
  useEffect(() => {
    if (!isEditing && JSON.stringify(answers) !== JSON.stringify(initialAnswers)) {
      handleSave();
    }
  }, [isEditing]);
  return (
    <div className='flex flex-col overflow-auto py-6'>
      {mockChecklistData.sections.map((section, index) => (
        <div key={section.id}>
          <div className='px-4 pb-6'>
            <div className='py-2'>
              <div className='bg-fill-secondary-700 w-fit rounded-lg px-2 py-1'>
                <div className='caption1-semibold text-text-primary-inverse'>{section.title}</div>
              </div>
            </div>
            <div className='flex flex-col'>
              {section.questions.map((question) => {
                const answer = findAnswerForQuestion(question.id);
                return (
                  <div className='py-4' key={question.id}>
                    <span className='body1-bold'>Q.{question.label}</span>
                    {question.type === 'TRI_STATE' && (
                      <div className='mt-1'>
                        <RadioGroup
                          disabled={!isEditing}
                          value={answer?.value || ''}
                          onValueChange={(value) => updateAnswer(question.id, value)}
                          className='flex flex-row gap-4'
                        >
                          {Object.entries(vaccinationOptions).map(([key, label]) => (
                            <RadioGroupItem value={key} key={key}>
                              {label}
                            </RadioGroupItem>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                    {question.type === 'INTEGER' && (
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='w-20'>
                          <TextField readOnly={!isEditing}>
                            <TextFieldInput
                              type='number'
                              placeholder='0'
                              min={question.validation?.min || 0}
                              max={question.validation?.max || 999}
                              value={answer?.value || ''}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                            />
                          </TextField>
                        </div>
                        <span className='body2-bold whitespace-nowrap'>마리</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {index < mockChecklistData.sections.length - 1 && <Divider className='my-4' size='thick' />}
        </div>
      ))}
    </div>
  );
}

export { ChecklistEditor };
