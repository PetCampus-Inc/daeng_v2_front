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

function updateOwnerNoticeTemplate(
  id: string,
  input: CreateOwnerNoticeTemplateInput
): OwnerNoticeTemplate | null {
  const templates = getOwnerNoticeTemplatesSnapshot();
  const index = templates.findIndex((template) => template.id === id);

  if (index === -1) return null;

  const existingTemplate = templates[index];

  if (!existingTemplate) return null;

  const updatedTemplate: OwnerNoticeTemplate = {
    id: existingTemplate.id,
    title: input.title,
    content: input.content,
    createdAt: existingTemplate.createdAt,
  };

  const nextTemplates = [...templates];
  nextTemplates[index] = updatedTemplate;
  saveOwnerNoticeTemplates(nextTemplates);

  return updatedTemplate;
}

function deleteOwnerNoticeTemplate(id: string): boolean {
  const templates = getOwnerNoticeTemplatesSnapshot();
  const nextTemplates = templates.filter((template) => template.id !== id);

  if (nextTemplates.length === templates.length) return false;

  saveOwnerNoticeTemplates(nextTemplates);

  return true;
}

function saveLoadedNoticeTemplateContent(content: string) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD, content);
}

function consumeLoadedNoticeTemplateContent(): string | null {
  if (typeof window === 'undefined') return null;

  const content = sessionStorage.getItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD);

  if (!content) return null;

  sessionStorage.removeItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD);

  return content;
}

export {
  addOwnerNoticeTemplate,
  consumeLoadedNoticeTemplateContent,
  deleteOwnerNoticeTemplate,
  getOwnerNoticeTemplatesSnapshot,
  saveLoadedNoticeTemplateContent,
  subscribeOwnerNoticeTemplates,
  updateOwnerNoticeTemplate,
  type CreateOwnerNoticeTemplateInput,
  type OwnerNoticeTemplate,
};
