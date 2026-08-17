import { api, type ApiResponse } from '@shared/api';

type SchoolPetMembershipStatus = 'ACTIVE' | 'PENDING';

interface GuardianInvite {
  schoolId: number;
  schoolName: string;
}

interface GuardianPetConnection {
  petId: number;
  name: string;
  profileImage: string | null;
  birthYear: number | null;
  gender: 'MALE' | 'FEMALE' | null;
  breed: string;
  connectionStatus: SchoolPetMembershipStatus | null;
}

interface GuardianPetConnectionList {
  totalProfileCount: number;
  pets: GuardianPetConnection[];
}

function getGuardianInvite(token: string) {
  return api.get(`guardian/invites/${encodeURIComponent(token)}`).json<ApiResponse<GuardianInvite>>();
}

function getGuardianPetConnectionStatuses() {
  return api.get('guardian/pets/connection-status').json<ApiResponse<GuardianPetConnectionList>>();
}

export {
  getGuardianInvite,
  getGuardianPetConnectionStatuses,
  type GuardianInvite,
  type GuardianPetConnection,
  type GuardianPetConnectionList,
  type SchoolPetMembershipStatus,
};
