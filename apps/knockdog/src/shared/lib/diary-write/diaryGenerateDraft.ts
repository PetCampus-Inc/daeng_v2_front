import { z } from 'zod';

const DIARY_GENERATE_DRAFT_KEY = 'diary-generate-draft';

const DIARY_DRAFT_SCHEMA = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dogName: z.string().min(1),
  petId: z.union([z.string().min(1), z.number().int().positive()]).transform(String),
  photos: z.array(z.string()),
  photoKeys: z.array(z.string()).default([]),
  text: z.string().default(''),
  attendanceRecordId: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((value) => (value == null ? null : String(value))),
});

const parseDiaryGenerateDraft = (value: unknown): DiaryGenerateDraft | null => {
  const parsed = DIARY_DRAFT_SCHEMA.safeParse(value);
  return parsed.success ? parsed.data : null;
};

interface DiaryGenerateDraft {
  date: string;
  dogName: string;
  petId?: string | null;
  photos: string[];
  photoKeys?: string[];
  text?: string;
  attendanceRecordId?: string | null;
}

function saveDiaryGenerateDraft(draft: DiaryGenerateDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_GENERATE_DRAFT_KEY, JSON.stringify(draft));
}

function readDiaryGenerateDraft(): DiaryGenerateDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(DIARY_GENERATE_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<DiaryGenerateDraft>;
    if (!draft.date || !draft.dogName || !Array.isArray(draft.photos)) return null;
    return {
      date: draft.date,
      dogName: draft.dogName,
      petId: draft.petId == null || draft.petId === '' ? null : String(draft.petId),
      photos: draft.photos.filter((photo) => typeof photo === 'string'),
      photoKeys: Array.isArray(draft.photoKeys) ? draft.photoKeys.filter((key) => typeof key === 'string') : [],
      text: typeof draft.text === 'string' ? draft.text : '',
      attendanceRecordId: draft.attendanceRecordId ? String(draft.attendanceRecordId) : null,
    };
  } catch {
    return null;
  }
}

export { readDiaryGenerateDraft, saveDiaryGenerateDraft, parseDiaryGenerateDraft };
export type { DiaryGenerateDraft };
