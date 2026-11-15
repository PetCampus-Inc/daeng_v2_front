interface SavedDiaryRecord {
  dateKey: string;
  petId: string | null;
}

function shouldShowDiaryNoteBanner(hasDailyNotice: boolean, hasWrittenDiary: boolean) {
  return hasDailyNotice && !hasWrittenDiary;
}

function hasSavedDiaryRecord(records: SavedDiaryRecord[], dateKey: string, petId: string | null) {
  const petKey = petId == null ? '' : String(petId);
  return records.some((record) => record.dateKey.slice(0, 10) === dateKey && String(record.petId ?? '') === petKey);
}

export { hasSavedDiaryRecord, shouldShowDiaryNoteBanner };
