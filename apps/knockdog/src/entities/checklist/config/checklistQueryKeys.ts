import { getAnswers } from '../api/answers';
import { getQuestions } from '../api/questions';

const checklistQueryKeys = {
  all: ['checklist'] as const,
  questions: () => [...checklistQueryKeys.all, 'questions'] as const,
  answers: (targetId: string) => [...checklistQueryKeys.all, 'answers', targetId] as const,
} as const;

const createChecklistQueryOptions = (targetId: string) => ({
  queryKey: checklistQueryKeys.answers(targetId),
  queryFn: () => getAnswers(targetId),
});

const createChecklistQuestionsQueryOptions = () => ({
  queryKey: checklistQueryKeys.questions(),
  queryFn: () => getQuestions(),
});

export { checklistQueryKeys, createChecklistQueryOptions, createChecklistQuestionsQueryOptions };
