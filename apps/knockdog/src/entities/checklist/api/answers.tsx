import type { AnswerGroup } from '../model/checklist';
import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요
interface AnswersResponse {
  sections: AnswerGroup[];
}

const getAnswers = async (targetId: string): Promise<AnswersResponse> => {
  const response = await api.get('/api/v0/memo/checklist/answer', {
    searchParams: {
      targetId,
    },
  });
  return response.json();
};

interface PostAnswersRequest {
  targetId: string;
  answers: { questionId: string; value: string }[];
}

const postAnswers = async ({ targetId, answers }: PostAnswersRequest) => {
  const response = await api.post('/api/v0/memo/checklist', {
    searchParams: {
      targetId,
    },
    json: {
      answers,
    },
  });
  return response.json();
};

export { getAnswers, type AnswersResponse, postAnswers, type PostAnswersRequest };
