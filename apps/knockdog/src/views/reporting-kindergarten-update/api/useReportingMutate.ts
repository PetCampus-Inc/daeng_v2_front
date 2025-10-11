import { createReportingMutationOptions, type ReportingRequest } from '@entities/reporting';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

function useReportingMutate(
  id: string,
  _initial: ReportingRequest,
  options?: Pick<UseMutationOptions<unknown, Error, ReportingRequest, unknown>, 'onSuccess' | 'onError'>
) {
  return useMutation({
    ...createReportingMutationOptions(id),
    ...options,
  });
}

export { useReportingMutate };
