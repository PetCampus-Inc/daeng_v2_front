import { useQuery } from '@tanstack/react-query';
import { createChecklistQueryOptions, createChecklistQuestionsQueryOptions } from '@entities/checklist';

const useChecklistQuestionsQuery = () => {
  return useQuery({
    ...createChecklistQuestionsQueryOptions(),
  });
};

const useChecklistAnswersQuery = (targetId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...createChecklistQueryOptions(targetId),
    enabled: options?.enabled !== false && !!targetId,
  });
};

export { useChecklistQuestionsQuery, useChecklistAnswersQuery };
