const DIARY_GENERATE_DRAFT_KEY = 'diary-generate-draft';

interface DiaryGenerateDraft {
  date: string;
  dogName: string;
  petId?: string | null;
  photos: string[];
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
    };
  } catch {
    return null;
  }
}

export { readDiaryGenerateDraft, saveDiaryGenerateDraft };
export type { DiaryGenerateDraft };
