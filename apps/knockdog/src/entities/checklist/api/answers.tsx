import type { Answer, AnswerGroup } from '../model/checklist';
import { toSavedChecklistAnswers } from '../lib/checklistAnswers';
import { ApiError, api } from '@shared/api';

interface AnswersResponse {
  sections: AnswerGroup[];
  updatedAt?: string | null;
}

interface ApiResponse {
  code: string;
  message: string;
  success: boolean;
  result: AnswersResponse;
}

const EMPTY_CHECKLIST: AnswersResponse = { sections: [], updatedAt: null };

function normalizeAnswer(answer: Answer): Answer {
  const memo = answer.memo?.trim() ?? '';

  return {
    ...answer,
    questionId: String(answer.questionId),
    question: answer.question ?? '',
    value: answer.value == null ? '' : String(answer.value),
    memo: memo || undefined,
  };
}

const getAnswers = async (targetId: string): Promise<AnswersResponse> => {
  try {
    const response = await api.get('memo/checklist/answer', {
      searchParams: {
        targetId,
      },
    });
    const data = await response.json<ApiResponse>();

    if (!data.success) throw new Error(data.message || '체크리스트를 불러올 수 없습니다');

    return {
      sections: (data.result.sections ?? []).map((section) => ({
        ...section,
        answers: (section.answers ?? []).map(normalizeAnswer),
      })),
      updatedAt: data.result.updatedAt ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return EMPTY_CHECKLIST;
    throw error;
  }
};

interface UpdateAnswersRequest {
  targetId: string;
  answers: { questionId: string; value: string; memo?: string }[];
}

const updateAnswers = async ({ targetId, answers }: UpdateAnswersRequest) => {
  const response = await api.post('memo/checklist', {
    searchParams: {
      targetId,
    },
    json: {
      answers: toSavedChecklistAnswers(answers),
    },
  });
  const data = await response.json<ApiResponse>();
  
  if (data.success) {
    return data.result;
  }
  
  throw new Error(data.message || '체크리스트를 저장할 수 없습니다');
};

export { getAnswers, type AnswersResponse, updateAnswers, type UpdateAnswersRequest };
