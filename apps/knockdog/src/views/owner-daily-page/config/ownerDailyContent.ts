interface AttendanceMember {
  id: string;
  name: string;
  guardianName?: string;
  gender: 'MALE' | 'FEMALE' | null;
  breed: string;
  weightKg: number | null;
  age?: number;
  profileImageUrl?: string;
  checkedIn: boolean;
  checkedInTime?: string;
  checkedOut: boolean;
  checkedOutTime?: string;
  noticebookSent: boolean;
}

interface OwnerDailySummaryItem {
  label: string;
  count: number;
}

export type { AttendanceMember, OwnerDailySummaryItem };
