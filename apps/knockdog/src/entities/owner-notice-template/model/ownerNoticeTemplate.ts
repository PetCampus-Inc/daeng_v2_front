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

function getLoadedNoticeTemplateStorageKey(noticeId: string) {
  return `${STORAGE_KEYS.OWNER_NOTICE_TEMPLATE_LOAD}:${noticeId}`;
}

/** bridge 성공 + remount 대비 fallback. noticeId로 스코프해 다른 알림장에 잘못 적용되지 않게 함 */
function saveLoadedNoticeTemplateContent(noticeId: string, content: string) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(getLoadedNoticeTemplateStorageKey(noticeId), content);
}

function peekLoadedNoticeTemplateContent(noticeId: string): string | null {
  if (typeof window === 'undefined') return null;

  return sessionStorage.getItem(getLoadedNoticeTemplateStorageKey(noticeId));
}

function consumeLoadedNoticeTemplateContent(noticeId: string): string | null {
  if (typeof window === 'undefined') return null;

  const key = getLoadedNoticeTemplateStorageKey(noticeId);
  const content = sessionStorage.getItem(key);
  if (content === null) return null;

  sessionStorage.removeItem(key);

  return content;
}

export {
  consumeLoadedNoticeTemplateContent,
  peekLoadedNoticeTemplateContent,
  saveLoadedNoticeTemplateContent,
  toCreateAttendanceRecordNoteTemplateRequest,
  toOwnerNoticeTemplate,
  toOwnerNoticeTemplates,
  type AttendanceRecordNoteTemplateDto,
  type CreateAttendanceRecordNoteTemplateRequest,
  type CreateOwnerNoticeTemplateInput,
  type OwnerNoticeTemplate,
};
