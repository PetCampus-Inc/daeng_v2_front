import { useMutation } from '@tanstack/react-query';
import { postAnswers, type PostAnswersRequest } from '@entities/checklist';

const useChecklistMutate = () => {
  return useMutation({
    mutationFn: postAnswers,
  });
};

export { useChecklistMutate };
