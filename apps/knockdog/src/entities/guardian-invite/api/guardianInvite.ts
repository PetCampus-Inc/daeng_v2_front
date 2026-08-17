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

interface GuardianApplicationCreateResult {
  petId: number;
  success: boolean;
  membershipId: number | null;
  reason: string | null;
}

interface GuardianApplicationCreateResponse {
  results: GuardianApplicationCreateResult[];
}

function getGuardianInvite(token: string) {
  return api.get(`guardian/invites/${encodeURIComponent(token)}`).json<ApiResponse<GuardianInvite>>();
}

function getGuardianPetConnectionStatuses() {
  return api.get('guardian/pets/connection-status').json<ApiResponse<GuardianPetConnectionList>>();
}

function postGuardianApplication(request: { token: string; petIds: number[] }) {
  return api.post('guardian/applications', { json: request }).json<ApiResponse<GuardianApplicationCreateResponse>>();
}

export {
  getGuardianInvite,
  getGuardianPetConnectionStatuses,
  postGuardianApplication,
  type GuardianInvite,
  type GuardianPetConnection,
  type GuardianPetConnectionList,
  type GuardianApplicationCreateResponse,
  type GuardianApplicationCreateResult,
  type SchoolPetMembershipStatus,
};
