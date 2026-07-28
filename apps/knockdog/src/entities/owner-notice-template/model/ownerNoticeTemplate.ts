import { STORAGE_KEYS } from '@shared/constants/storage';

/** 서버 DTO — attendance-record-note-templates */
interface AttendanceRecordNoteTemplateDto {
  id: number | string;
  title: string;
  note: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface CreateAttendanceRecordNoteTemplateRequest {
  title: string;
  note: string;
}

interface OwnerNoticeTemplate {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateOwnerNoticeTemplateInput {
  title: string;
  content: string;
}

function toOwnerNoticeTemplate(dto: AttendanceRecordNoteTemplateDto): OwnerNoticeTemplate {
  return {
    id: String(dto.id),
    title: dto.title,
    content: dto.note,
    createdAt: dto.createdAt ?? undefined,
    updatedAt: dto.updatedAt ?? undefined,
  };
}

function toOwnerNoticeTemplates(
  data: AttendanceRecordNoteTemplateDto[] | { templates?: AttendanceRecordNoteTemplateDto[] } | null
): OwnerNoticeTemplate[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map(toOwnerNoticeTemplate);
  }

  if (Array.isArray(data.templates)) {
    return data.templates.map(toOwnerNoticeTemplate);
  }

  return [];
}

function toCreateAttendanceRecordNoteTemplateRequest(
  input: CreateOwnerNoticeTemplateInput
): CreateAttendanceRecordNoteTemplateRequest {
  return {
    title: input.title,
    note: input.content,
  };
}

function saveLoadedNoticeTemplateContent(content: string) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD, content);
}

function consumeLoadedNoticeTemplateContent(): string | null {
  if (typeof window === 'undefined') return null;

  const content = sessionStorage.getItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD);
  if (content === null) return null;

  sessionStorage.removeItem(STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD);

  return content;
}

export {
  consumeLoadedNoticeTemplateContent,
  saveLoadedNoticeTemplateContent,
  toCreateAttendanceRecordNoteTemplateRequest,
  toOwnerNoticeTemplate,
  toOwnerNoticeTemplates,
  type AttendanceRecordNoteTemplateDto,
  type CreateAttendanceRecordNoteTemplateRequest,
  type CreateOwnerNoticeTemplateInput,
  type OwnerNoticeTemplate,
};
