import api from '@shared/api/ky-client';
import type { QuestionGroup } from '../model/checklist';

interface QuestionGroupResponse {
  sections: QuestionGroup[];
}

async function getQuestions(): Promise<QuestionGroupResponse> {
  const response = await api.get('/api/v0/memo/checklist');
  return response.json();
}

export { getQuestions, type QuestionGroupResponse };
