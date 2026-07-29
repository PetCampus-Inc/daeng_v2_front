import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUserStore } from '@entities/user';

import type { CreateOwnerNoticeTemplateInput } from '../model/ownerNoticeTemplate';
import {
  deleteAttendanceRecordNoteTemplate,
  postAttendanceRecordNoteTemplate,
  patchAttendanceRecordNoteTemplate,
} from './attendanceRecordNoteTemplate';
import {
  ownerNoticeTemplateDetailQueryKey,
  ownerNoticeTemplatesQueryKey,
} from './useOwnerNoticeTemplateQuery';

function useOwnerNoticeTemplateMutation() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  const invalidateTemplates = async (templateId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ownerNoticeTemplatesQueryKey(userId) }),
      ...(templateId
        ? [
            queryClient.invalidateQueries({
              queryKey: ownerNoticeTemplateDetailQueryKey(templateId, userId),
            }),
          ]
        : []),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: postAttendanceRecordNoteTemplate,
    onSuccess: async () => {
      await invalidateTemplates();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: CreateOwnerNoticeTemplateInput;
    }) => patchAttendanceRecordNoteTemplate(templateId, input),
    onSuccess: async (_data, variables) => {
      await invalidateTemplates(variables.templateId);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAttendanceRecordNoteTemplate,
    onSuccess: async (_data, templateId) => {
      await invalidateTemplates(templateId);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export { useOwnerNoticeTemplateMutation };
