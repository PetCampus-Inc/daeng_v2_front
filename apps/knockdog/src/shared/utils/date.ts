export function parseArrayToDate(dateArray: number[]): Date {
  const [year = 0, month = 1, day = 1, hours = 0, min = 0, sec = 0, ms = 0] = dateArray;
  return new Date(year, month - 1, day, hours, min, sec, ms);
}

export function getTimeRemaining(targetDate: Date) {
  const now = new Date();
  const total = Math.max(0, targetDate.getTime() - now.getTime());

  const sec = Math.floor((total / 1000) % 60);
  const min = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

  return { hours, min, sec };
}
