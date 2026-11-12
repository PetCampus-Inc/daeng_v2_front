const DIARY_GENERATE_DRAFT_KEY = 'diary-generate-draft';

interface DiaryGenerateDraft {
  date: string;
  dogName: string;
  photos: string[];
}

function saveDiaryGenerateDraft(draft: DiaryGenerateDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DIARY_GENERATE_DRAFT_KEY, JSON.stringify(draft));
}

function readDiaryGenerateDraft(): DiaryGenerateDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(DIARY_GENERATE_DRAFT_KEY);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as Partial<DiaryGenerateDraft>;
    if (!draft.date || !draft.dogName || !Array.isArray(draft.photos)) return null;
    return { date: draft.date, dogName: draft.dogName, photos: draft.photos.filter((photo) => typeof photo === 'string') };
  } catch {
    return null;
  }
}

export { readDiaryGenerateDraft, saveDiaryGenerateDraft };
export type { DiaryGenerateDraft };
