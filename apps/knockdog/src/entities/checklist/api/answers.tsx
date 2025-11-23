import type { AnswerGroup } from '../model/checklist';
import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요
interface AnswersResponse {
  sections: AnswerGroup[];
}

interface ApiResponse {
  code: string;
  message: string;
  success: boolean;
  result: AnswersResponse;
}

const getAnswers = async (targetId: string): Promise<AnswersResponse> => {
  const response = await api.get('memo/checklist/answer', {
    searchParams: {
      targetId,
    },
  });
  const data = await response.json<ApiResponse>();
  
  if (data.success) {
    return data.result;
  }
  
  throw new Error(data.message || '체크리스트를 불러올 수 없습니다');
};

interface UpdateAnswersRequest {
  targetId: string;
  answers: { questionId: string; value: string }[];
}

const updateAnswers = async ({ targetId, answers }: UpdateAnswersRequest) => {
  const response = await api.post('memo/checklist', {
    searchParams: {
      targetId,
    },
    json: {
      answers,
    },
  });
  const data = await response.json<ApiResponse>();
  
  if (data.success) {
    return data.result;
  }
  
  throw new Error(data.message || '체크리스트를 저장할 수 없습니다');
};

export { getAnswers, type AnswersResponse, updateAnswers, type UpdateAnswersRequest };
