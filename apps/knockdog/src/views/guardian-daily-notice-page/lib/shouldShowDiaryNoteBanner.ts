function shouldShowDiaryNoteBanner(hasDailyNotice: boolean, hasWrittenDiary: boolean) {
  return hasDailyNotice && !hasWrittenDiary;
}

export { shouldShowDiaryNoteBanner };
