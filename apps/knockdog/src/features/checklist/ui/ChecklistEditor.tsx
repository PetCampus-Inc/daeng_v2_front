'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem, TextField, TextFieldInput, Divider } from '@knockdog/ui';
import { vaccinationOptions } from '@features/dog-school';
import { useChecklistQuestionsQuery } from '../api/useChecklistQuery';
import { AnswerGroup } from '@entities/checklist';

interface ChecklistEditorProps {
  isEditing: boolean;
  initialAnswers: AnswerGroup[];
}

function ChecklistEditor({ isEditing, initialAnswers }: ChecklistEditorProps) {
  const [answers, setAnswers] = useState<AnswerGroup[]>(initialAnswers ?? []);
  const { data: questions } = useChecklistQuestionsQuery();


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
      // questionId가 속한 섹션 찾기
      const questionSection = questions?.sections.find((section) =>
        section.questions.some((q) => q.id === questionId)
      );

      if (!questionSection) return prevAnswers;

      // 해당 섹션이 이미 있는지 확인
      const sectionIndex = prevAnswers.findIndex((ag) => ag.sectionId === questionSection.id);

      if (sectionIndex >= 0) {
        // 섹션이 있으면 기존 답변 업데이트 또는 새 답변 추가
        return prevAnswers.map((answerGroup, idx) => {
          if (idx !== sectionIndex) return answerGroup;

          const answerIndex = answerGroup.answers.findIndex((a) => a.questionId === questionId);
          const question = questionSection.questions.find((q) => q.id === questionId);

          if (answerIndex >= 0) {
            // 기존 답변 업데이트
            return {
              ...answerGroup,
              answers: answerGroup.answers.map((answer) =>
                answer.questionId === questionId ? { ...answer, value } : answer
              ),
            };
          } else {
            // 새 답변 추가
            return {
              ...answerGroup,
              answers: [
                ...answerGroup.answers,
                { questionId, question: question?.label || '', value },
              ],
            };
          }
        });
      } else {
        // 섹션이 없으면 새로 생성
        const question = questionSection.questions.find((q) => q.id === questionId);
        return [
          ...prevAnswers,
          {
            sectionId: questionSection.id,
            title: questionSection.title,
            answers: [{ questionId, question: question?.label || '', value }],
          },
        ];
      }
    });
  };

  return (
    <div className='flex flex-col overflow-auto py-6'>
      {questions?.sections?.map((section, index) => (
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
          {index < questions?.sections.length - 1 && <Divider className='my-4' size='thick' />}
        </div>
      ))}
    </div>
  );
}

export { ChecklistEditor };
