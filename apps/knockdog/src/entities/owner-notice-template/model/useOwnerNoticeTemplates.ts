'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  addOwnerNoticeTemplate,
  getOwnerNoticeTemplatesSnapshot,
  subscribeOwnerNoticeTemplates,
  type CreateOwnerNoticeTemplateInput,
  type OwnerNoticeTemplate,
} from './ownerNoticeTemplate';

function useOwnerNoticeTemplates() {
  const templates = useSyncExternalStore(
    subscribeOwnerNoticeTemplates,
    getOwnerNoticeTemplatesSnapshot,
    () => [] as OwnerNoticeTemplate[]
  );

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

  const createTemplate = useCallback((input: CreateOwnerNoticeTemplateInput) => {
    return addOwnerNoticeTemplate(input);
  }, []);

  return {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    createTemplate,
    hasTemplates: templates.length > 0,
    templateCount: templates.length,
  };
}

export { useOwnerNoticeTemplates };
