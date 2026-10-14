interface ChecklistAnswerInput {
  questionId: string;
  value: string;
  memo?: string | null;
}

interface SavedChecklistAnswer {
  questionId: string;
  value: string;
  memo: string;
}

function toSavedChecklistAnswers(answers: ChecklistAnswerInput[]): SavedChecklistAnswer[] {
  return answers.flatMap((answer) => {
    const value = String(answer.value ?? '').trim();
    const memo = answer.memo?.trim() ?? '';
    const hasChoice = value === 'YES' || value === 'NO';
    const hasNumber = /^\d+$/.test(value);

    if (!hasChoice && !hasNumber && !memo) return [];

    return [
      {
        questionId: answer.questionId,
        value: hasChoice || hasNumber ? value : '',
        memo,
      },
    ];
  });
}

export { toSavedChecklistAnswers };
export type { ChecklistAnswerInput, SavedChecklistAnswer };
