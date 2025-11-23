import { api } from '@shared/api';
import type { QuestionGroup } from '../model/checklist';

// @TODO API Response, 타입 정의 필요
interface QuestionGroupResponse {
  sections: QuestionGroup[];
}

async function getQuestions(): Promise<QuestionGroupResponse> {
  const response = await api.get('memo/checklist');
  return response.json();
}

export { getQuestions, type QuestionGroupResponse };
