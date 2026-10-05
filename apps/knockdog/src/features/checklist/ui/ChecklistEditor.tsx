'use client';

import { useEffect, useRef, useState } from 'react';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Chip,
  Divider,
  Icon,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';
import { useChecklistQuestionsQuery } from '../api/useChecklistQuery';
import { Answer, AnswerGroup } from '@entities/checklist';

interface ChecklistEditorProps {
  isEditing: boolean;
  answers: AnswerGroup[];
  onAnswersChange: (nextAnswers: AnswerGroup[]) => void;
}

function ChecklistEditor({ isEditing, answers, onAnswersChange }: ChecklistEditorProps) {
  const safeAnswers = answers ?? [];
  const { data: questions } = useChecklistQuestionsQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [openMemoIds, setOpenMemoIds] = useState<string[]>([]);
  const [focusedMemoId, setFocusedMemoId] = useState<string | null>(null);
  const sections = questions?.sections ?? [];
  const currentSectionId = activeSectionId ?? sections[0]?.id ?? null;

  useEffect(() => {
    const root = scrollRef.current;
    const sectionList = questions?.sections ?? [];
    if (!root || sectionList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        const sectionId = visible[0]?.target.getAttribute('data-section-id');
        if (sectionId) setActiveSectionId(sectionId);
      },
      { root, rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    sectionList.forEach((section) => {
      const element = document.getElementById(`checklist-section-${section.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [questions?.sections]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    scrollLockRef.current = true;
    document.getElementById(`checklist-section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      scrollLockRef.current = false;
    }, 600);
  };

  // answerId와 questionId를 매칭하는 함수
  const findAnswerForQuestion = (questionId: string) => {
    for (const answerGroup of safeAnswers) {
      const answer = answerGroup.answers.find((answer) => answer.questionId === questionId);
      if (answer) return answer;
    }
    return null;
  };

  const patchAnswer = (questionId: string, patch: Partial<Pick<Answer, 'value' | 'memo'>>) => {
    if (!isEditing) return;

    const questionSection = questions?.sections.find((section) =>
      section.questions.some((question) => question.id === questionId)
    );

    if (!questionSection) return;

    const question = questionSection.questions.find((item) => item.id === questionId);
    const sectionIndex = safeAnswers.findIndex((answerGroup) => answerGroup.sectionId === questionSection.id);

    if (sectionIndex >= 0) {
      const nextAnswers = safeAnswers.map((answerGroup, idx) => {
        if (idx !== sectionIndex) return answerGroup;

        const answerIndex = answerGroup.answers.findIndex((item) => item.questionId === questionId);

        if (answerIndex >= 0) {
          return {
            ...answerGroup,
            answers: answerGroup.answers.map((answer) =>
              answer.questionId === questionId ? { ...answer, ...patch } : answer
            ),
          };
        }

        return {
          ...answerGroup,
          answers: [
            ...answerGroup.answers,
            { questionId, question: question?.label ?? '', value: patch.value ?? '', memo: patch.memo },
          ],
        };
      });

      onAnswersChange(nextAnswers);
      return;
    }

    const nextAnswers: AnswerGroup[] = [
      ...safeAnswers,
      {
        sectionId: questionSection.id,
        title: questionSection.title,
        answers: [{ questionId, question: question?.label ?? '', value: patch.value ?? '', memo: patch.memo }],
      },
    ];

    onAnswersChange(nextAnswers);
  };

  const closeMemo = (questionId: string) => {
    setOpenMemoIds((ids) => ids.filter((id) => id !== questionId));
    setFocusedMemoId((id) => (id === questionId ? null : id));

    const nextAnswers = safeAnswers
      .map((answerGroup) => ({
        ...answerGroup,
        answers: answerGroup.answers.flatMap((answer) => {
          if (answer.questionId !== questionId) return [answer];
          if (answer.value.trim() === '') return [];
          return [{ ...answer, memo: '' }];
        }),
      }))
      .filter((answerGroup) => answerGroup.answers.length > 0);

    onAnswersChange(nextAnswers);
  };

  const handleRemoveMemo = (questionId: string) => {
    const memo = findAnswerForQuestion(questionId)?.memo ?? '';
    if (memo.trim() === '') {
      closeMemo(questionId);
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>해당 메모를 삭제할까요?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                closeMemo(questionId);
                close();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleOpenMemo = (questionId: string) => {
    setOpenMemoIds((ids) => (ids.includes(questionId) ? ids : [...ids, questionId]));
    setFocusedMemoId(questionId);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='scrollbar-hide flex shrink-0 flex-nowrap gap-2 overflow-x-auto px-4 py-4'>
        {sections.map((section) => (
          <div key={section.id} className='shrink-0'>
            <Chip.Toggle
              variant='outline'
              checked={currentSectionId === section.id}
              onChange={() => handleSectionClick(section.id)}
            >
              <Chip.Label>
                <span className='whitespace-nowrap'>{section.title}</span>
              </Chip.Label>
            </Chip.Toggle>
          </div>
        ))}
      </div>
      <div ref={scrollRef} className='min-h-0 flex-1 overflow-y-auto'>
        {sections.map((section, index) => (
          <div key={section.id} id={`checklist-section-${section.id}`} data-section-id={section.id}>
            <div className='px-4 py-5'>
              <p className='h3-extrabold mb-5'>{section.title}</p>
              <div className='flex flex-col gap-4'>
                {section.questions.map((question) => {
                  const answer = findAnswerForQuestion(question.id);
                  const isMemoOpen = openMemoIds.includes(question.id) || Boolean(answer?.memo);
                  return (
                    <div key={question.id}>
                      <div className='flex items-center justify-between gap-3'>
                        <span className='body1-bold min-w-0 flex-1'>Q. {question.label}</span>
                        {question.type === 'TRI_STATE' && (
                          <div className='flex shrink-0 gap-2'>
                              <button
                                type='button'
                                aria-label='예'
                                aria-pressed={answer?.value === 'YES'}
                                disabled={!isEditing}
                                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
                                onClick={() => patchAnswer(question.id, { value: answer?.value === 'YES' ? '' : 'YES' })}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 PNG 아이콘 */}
                                <img
                                  src={answer?.value === 'YES' ? '/images/ico_like.png' : '/images/ico_like_default.png'}
                                  alt=''
                                  width={24}
                                  height={24}
                                  className='size-6'
                                  draggable={false}
                                />
                              </button>
                              <button
                                type='button'
                                aria-label='아니요'
                                aria-pressed={answer?.value === 'NO'}
                                disabled={!isEditing}
                                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
                                onClick={() => patchAnswer(question.id, { value: answer?.value === 'NO' ? '' : 'NO' })}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 PNG 아이콘 */}
                                <img
                                  src={
                                    answer?.value === 'NO'
                                      ? '/images/ico_dislike.png'
                                      : '/images/ico_dislike_default.png'
                                  }
                                  alt=''
                                  width={24}
                                  height={24}
                                  className='size-6'
                                  draggable={false}
                                />
                              </button>
                            </div>
                        )}
                      </div>
                      {!isMemoOpen && (
                        <button
                          type='button'
                          disabled={!isEditing}
                          className='body2-regular text-text-caption mt-2 disabled:opacity-50'
                          onClick={() => handleOpenMemo(question.id)}
                        >
                          메모 추가 +
                        </button>
                      )}
                      {question.type === 'INTEGER' && (
                        <div className='mt-2 flex items-center gap-2'>
                          <div className='w-20'>
                            <TextField readOnly={!isEditing}>
                              <TextFieldInput
                                type='number'
                                placeholder='0'
                                inputMode='numeric'
                                pattern='[0-9]*'
                                value={answer?.value || ''}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  if (value === '' || (value.length <= 2 && /^\d+$/.test(value))) {
                                    patchAnswer(question.id, { value });
                                  }
                                }}
                              />
                            </TextField>
                          </div>
                          <span className='body2-bold whitespace-nowrap'>마리</span>
                        </div>
                      )}
                      {isMemoOpen && (
                        <div className='mt-2 flex items-center gap-2'>
                          <div className='bg-fill-secondary-50 radius-r2 flex h-12 min-w-0 flex-1 items-center px-4'>
                            <input
                              value={answer?.memo ?? ''}
                              placeholder='메모를 입력해 주세요'
                              autoFocus={focusedMemoId === question.id}
                              readOnly={!isEditing}
                              className='body2-regular caret-text-accent placeholder:text-text-caption text-text-primary min-w-0 flex-1 bg-transparent outline-none'
                              onChange={(event) => {
                                setOpenMemoIds((ids) => (ids.includes(question.id) ? ids : [...ids, question.id]));
                                patchAnswer(question.id, { memo: event.target.value });
                              }}
                            />
                          </div>
                          <button
                            type='button'
                            aria-label='메모 삭제'
                            disabled={!isEditing}
                            className='text-text-primary inline-flex size-5 shrink-0 items-center justify-center disabled:opacity-50'
                            onClick={() => handleRemoveMemo(question.id)}
                          >
                            <Icon icon='Close' className='size-5' />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {index < sections.length - 1 && <Divider size='thick' />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { ChecklistEditor };
