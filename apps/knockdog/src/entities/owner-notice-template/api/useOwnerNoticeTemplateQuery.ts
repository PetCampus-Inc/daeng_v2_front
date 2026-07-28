import { useQuery } from '@tanstack/react-query';

import { toOwnerNoticeTemplate, toOwnerNoticeTemplates } from '../model/ownerNoticeTemplate';
import {
  getAttendanceRecordNoteTemplate,
  getAttendanceRecordNoteTemplates,
} from './attendanceRecordNoteTemplate';

const OWNER_NOTICE_TEMPLATES_QUERY_KEY = 'ownerNoticeTemplates';
const OWNER_NOTICE_TEMPLATE_DETAIL_QUERY_KEY = 'ownerNoticeTemplateDetail';

const ownerNoticeTemplatesQueryKey = (userId?: string) =>
  [OWNER_NOTICE_TEMPLATES_QUERY_KEY, userId] as const;

const ownerNoticeTemplateDetailQueryKey = (templateId?: string, userId?: string) =>
  [OWNER_NOTICE_TEMPLATE_DETAIL_QUERY_KEY, templateId, userId] as const;

interface UseOwnerNoticeTemplatesQueryOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseOwnerNoticeTemplateDetailQueryOptions {
  templateId?: string;
  userId?: string;
  enabled?: boolean;
}

function useOwnerNoticeTemplatesQuery({
  userId,
  enabled = true,
}: UseOwnerNoticeTemplatesQueryOptions = {}) {
  return useQuery({
    queryKey: ownerNoticeTemplatesQueryKey(userId),
    queryFn: getAttendanceRecordNoteTemplates,
    select: (response) => toOwnerNoticeTemplates(response.data),
    enabled,
    staleTime: 0,
  });
}

function useOwnerNoticeTemplateDetailQuery({
  templateId,
  userId,
  enabled = true,
}: UseOwnerNoticeTemplateDetailQueryOptions) {
  return useQuery({
    queryKey: ownerNoticeTemplateDetailQueryKey(templateId, userId),
    queryFn: () => getAttendanceRecordNoteTemplate(templateId!),
    select: (response) => toOwnerNoticeTemplate(response.data),
    enabled: enabled && Boolean(templateId),
    staleTime: 0,
  });
}

export {
  OWNER_NOTICE_TEMPLATE_DETAIL_QUERY_KEY,
  OWNER_NOTICE_TEMPLATES_QUERY_KEY,
  ownerNoticeTemplateDetailQueryKey,
  ownerNoticeTemplatesQueryKey,
  useOwnerNoticeTemplateDetailQuery,
  useOwnerNoticeTemplatesQuery,
};
