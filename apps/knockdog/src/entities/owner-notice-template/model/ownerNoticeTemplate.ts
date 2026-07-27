import { STORAGE_KEYS } from '@shared/constants/storage';

interface OwnerNoticeTemplate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface CreateOwnerNoticeTemplateInput {
  title: string;
  content: string;
}

const templateListeners = new Set<() => void>();

let cachedTemplatesRaw: string | null | undefined;
let cachedTemplatesSnapshot: OwnerNoticeTemplate[] = [];

function notifyTemplateChange() {
  templateListeners.forEach((listener) => listener());
}

function subscribeOwnerNoticeTemplates(listener: () => void) {
  templateListeners.add(listener);

  return () => {
    templateListeners.delete(listener);
  };
}

function isOwnerNoticeTemplate(value: unknown): value is OwnerNoticeTemplate {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.content === 'string' &&
    typeof record.createdAt === 'string'
  );
}

function getOwnerNoticeTemplatesSnapshot(): OwnerNoticeTemplate[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATES);

  if (raw === cachedTemplatesRaw) {
    return cachedTemplatesSnapshot;
  }

  cachedTemplatesRaw = raw;

  if (!raw) {
    cachedTemplatesSnapshot = [];
    return cachedTemplatesSnapshot;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedTemplatesSnapshot = Array.isArray(parsed)
      ? parsed.filter(isOwnerNoticeTemplate)
      : [];
  } catch {
    cachedTemplatesSnapshot = [];
  }

  return cachedTemplatesSnapshot;
}

function saveOwnerNoticeTemplates(templates: OwnerNoticeTemplate[]) {
  if (typeof window === 'undefined') return;

  const raw = JSON.stringify(templates);
  localStorage.setItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATES, raw);
  cachedTemplatesRaw = raw;
  cachedTemplatesSnapshot = templates;
  notifyTemplateChange();
}

function addOwnerNoticeTemplate(input: CreateOwnerNoticeTemplateInput): OwnerNoticeTemplate {
  const template: OwnerNoticeTemplate = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
    createdAt: new Date().toISOString(),
  };

  saveOwnerNoticeTemplates([template, ...getOwnerNoticeTemplatesSnapshot()]);

  return template;
}

export {
  addOwnerNoticeTemplate,
  getOwnerNoticeTemplatesSnapshot,
  subscribeOwnerNoticeTemplates,
  type CreateOwnerNoticeTemplateInput,
  type OwnerNoticeTemplate,
};
