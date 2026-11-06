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

    const ids = templateIds.split(',');

    setSelectedTemplateId((current) => {
      if (current && ids.includes(current)) return current;
      // 선택 중이던 템플릿이 삭제된 경우 → 남은 첫 항목으로 맞춤 (UI·불러오기 버튼 동기화)
      if (current) return ids[0];
      return undefined;
    });
  }, [templateIds]);

  return {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    hasTemplates: templates.length > 0,
    templateCount: templates.length,
    templateIds,
    isLoading,
    isError,
    refetch,
  };
}

export { useOwnerNoticeTemplates };
