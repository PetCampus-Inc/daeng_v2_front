'use client';

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem, TextField, TextFieldInput, Divider } from '@knockdog/ui';
import { QuestionAnswers, mockChecklistData, vaccinationOptions, ChecklistEditApi } from '@features/dog-school';

interface ChecklistEditorProps {
  isEditing: boolean;
  onSave: () => void;
}

export function ChecklistEditor({ isEditing, onSave }: ChecklistEditorProps) {
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadChecklistData();
  }, []);

  // 체크리스트 데이터 로드
  const loadChecklistData = async () => {
    try {
      const savedData = await ChecklistEditApi.loadAnswers();
      if (Object.keys(savedData).length > 0) {
        setAnswers(savedData);
      } else {
        // 기본값 설정
        const defaultAnswers = ChecklistEditApi.generateDefaultAnswers();
        setAnswers(defaultAnswers);
      }
    } catch (error) {
      console.error('체크리스트 데이터 로드 실패:', error);
    }
  };

  // 답변 업데이트
  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // 편집 완료 및 저장
  const handleSave = async () => {
    if (!isEditing) return;

    setIsLoading(true);
    try {
      await ChecklistEditApi.saveAnswers(answers);
      onSave();
    } catch (error) {
      console.error('체크리스트 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 편집 모드 변경 시 자동 저장
  useEffect(() => {
    if (!isEditing && Object.keys(answers).length > 0) {
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
              {section.questions.map((question) => (
                <div className='py-4' key={question.id}>
                  <span className='body1-bold'>Q.{question.label}</span>
                  {question.type === 'TRI_STATE' && (
                    <div className='mt-1'>
                      <RadioGroup
                        disabled={!isEditing}
                        className='flex flex-row gap-4'
                        value={(answers[question.id] as string) || 'UNKNOWN'}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
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
                            value={(answers[question.id] as number) || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const min = question.validation?.min || 0;
                              const max = question.validation?.max || 999;
                              const clampedValue = Math.max(min, Math.min(max, value));
                              handleAnswerChange(question.id, clampedValue);
                            }}
                            min={question.validation?.min || 0}
                            max={question.validation?.max || 999}
                          />
                        </TextField>
                      </div>
                      <span className='body2-bold whitespace-nowrap'>마리</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {index < mockChecklistData.sections.length - 1 && <Divider className='my-4' size='thick' />}
        </div>
      ))}
    </div>
  );
}
