'use client';

import { useEffect, useState } from 'react';

import { useUserStore } from '@entities/user';

import { useOwnerNoticeTemplatesQuery } from '../api/useOwnerNoticeTemplateQuery';

function useOwnerNoticeTemplates() {
  const userId = useUserStore((state) => state.user?.userId);
  const { data: templates = [], isLoading, isError, refetch } = useOwnerNoticeTemplatesQuery({
    userId,
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const templateIds = templates.map((template) => template.id).join(',');

  useEffect(() => {
    if (!templateIds) {
      setSelectedTemplateId(undefined);
      return;
    }

    setSelectedTemplateId((current) => {
      if (!current) return undefined;
      if (templateIds.split(',').includes(current)) return current;
      return undefined;
    });
  }, [templateIds]);

  return {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    hasTemplates: templates.length > 0,
    templateCount: templates.length,
    isLoading,
    isError,
    refetch,
  };
}

export { useOwnerNoticeTemplates };
