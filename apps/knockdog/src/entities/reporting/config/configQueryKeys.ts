import { postReporting } from '../api/reporting';
import type { ReportingRequest } from '../api/reporting';

const reportingMutationKeys = {
  all: ['reporting'] as const,
  byId: (id: string) => [...reportingMutationKeys.all, id] as const,
} as const;

const createReportingMutationOptions = (id: string) => ({
  mutationKey: reportingMutationKeys.byId(id),
  mutationFn: (params: ReportingRequest) => postReporting(id, params),
});

export { createReportingMutationOptions };
