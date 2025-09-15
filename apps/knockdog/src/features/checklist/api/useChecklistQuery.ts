import { useQuery } from '@tanstack/react-query';
import { createChecklistQueryOptions, createChecklistQuestionsQueryOptions } from '@entities/checklist';

const useChecklistQuestionsQuery = () => {
  return useQuery({
    ...createChecklistQuestionsQueryOptions(),
  });
};

const useChecklistAnswersQuery = (targetId: string) => {
  return useQuery({
    ...createChecklistQueryOptions(targetId),
  });
};

export { useChecklistQuestionsQuery, useChecklistAnswersQuery };
