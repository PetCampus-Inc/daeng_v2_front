import { create } from 'zustand';

import { INITIAL_MEMBERS, type AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

interface OwnerDailyAttendanceState {
  members: AttendanceMember[];
  cancelCheckIn: (memberId: string) => void;
  cancelCheckOut: (memberId: string) => void;
  checkIn: (memberId: string) => void;
  checkOut: (memberId: string) => void;
}

// TODO: 등원/하원 API 계약 연결 후 서버 상태 기반 query/mutation으로 교체합니다.
const useOwnerDailyAttendanceStore = create<OwnerDailyAttendanceState>((set) => ({
  members: INITIAL_MEMBERS,
  cancelCheckIn: (memberId) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              checkedIn: false,
              checkedInTime: undefined,
              checkedOut: false,
              checkedOutTime: undefined,
            }
          : member
      ),
    })),
  cancelCheckOut: (memberId) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, checkedOut: false, checkedOutTime: undefined } : member
      ),
    })),
  checkIn: (memberId) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, checkedIn: true, checkedInTime: '오전 9:00' } : member
      ),
    })),
  checkOut: (memberId) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, checkedOut: true, checkedOutTime: '오후 6:00' } : member
      ),
    })),
}));

export { useOwnerDailyAttendanceStore };
