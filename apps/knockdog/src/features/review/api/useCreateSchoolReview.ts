import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSchoolReview, schoolReviewQueryKeys, type CreateSchoolReviewParams } from '@entities/review';

function useCreateSchoolReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateSchoolReviewParams) => createSchoolReview(params),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: [...schoolReviewQueryKeys.all, variables.schoolId] });
    },
  });
}

export { useCreateSchoolReview };
