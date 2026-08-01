interface AttendanceMember {
  id: string;
  name: string;
  guardianName?: string;
  gender: 'MALE' | 'FEMALE';
  breed: string;
  weightKg: number;
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

const OWNER_DAILY_DATE_LABEL = '6월 18일 (화)';

const INITIAL_MEMBERS: AttendanceMember[] = [
  {
    id: '1',
    name: '초코',
    gender: 'MALE',
    breed: '사모예드',
    weightKg: 8,
    age: 3,
    checkedIn: false,
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '2',
    name: '구름',
    gender: 'FEMALE',
    breed: '비숑',
    weightKg: 5,
    checkedIn: false,
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '3',
    name: '두부',
    gender: 'MALE',
    breed: '푸들',
    weightKg: 6,
    age: 4,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '4',
    name: '두   두부부',
    gender: 'FEMALE',
    breed: '말티즈',
    weightKg: 4,
    age: 2,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: true,
    checkedOutTime: '오후 6:00',
    noticebookSent: false,
  },
  {
    id: '5',
    name: '보리',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: true,
    checkedOutTime: '오후 6:00',
    noticebookSent: true,
  },
  {
    id: '6',
    name: '보리66',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '7',
    name: '보리77',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '8',
    name: '보리88',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '9',
    name: '보리99.',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 10,
    checkedIn: true,
    checkedInTime: '오전 9:00',
    checkedOut: false,
    noticebookSent: true,
  },
];

export { INITIAL_MEMBERS, OWNER_DAILY_DATE_LABEL };
export type { AttendanceMember, OwnerDailySummaryItem };
