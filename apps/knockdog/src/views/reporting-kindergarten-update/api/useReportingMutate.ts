import { createReportingMutationOptions, type ReportingRequest } from '@entities/reporting';
import { useMutation } from '@tanstack/react-query';

function useReportingMutate(id: string, _initial: ReportingRequest) {
  return useMutation({
    ...createReportingMutationOptions(id),
  });
}

export { useReportingMutate };
