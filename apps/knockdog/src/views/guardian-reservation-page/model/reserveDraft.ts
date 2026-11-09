interface ReserveDraft {
  dogId: string;
  ticketId: string;
  dateKey: string;
  minutes: number | null;
}

let draft: ReserveDraft | null = null;

function saveReserveDraft(next: ReserveDraft) {
  draft = next;
}

function readReserveDraft(dogId: string, ticketId: string) {
  if (!draft || draft.dogId !== dogId || draft.ticketId !== ticketId) return null;
  return draft;
}

function clearReserveDraft() {
  draft = null;
}

export { clearReserveDraft, readReserveDraft, saveReserveDraft };
export type { ReserveDraft };
