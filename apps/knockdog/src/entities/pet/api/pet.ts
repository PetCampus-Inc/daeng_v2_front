import { api, ApiResponse } from '@shared/api';

import { Gender, Pet, Relationship } from '../model/pet';

interface RegisterPetRequest {
  name: string;
  relationship: Relationship;
  profileImage: string;
}

interface PetResponse extends Pet {
  createdAt: string;
  updatedAt: string;
}

const postRegisterPet = async (pet: RegisterPetRequest) => {
  return await api
    .post(`pet/register`, {
      json: pet,
    })
    .json<ApiResponse<PetResponse>>();
};

interface UpdatePetDetailRequest {
  petId: string;
  name?: string;
  relationship?: Relationship;
  profileImageUrl?: string;
  breed?: string;
  birthYear?: number;
  gender?: Gender;
  isNeutered?: boolean;
  weight?: number;
}

const postUpdatePetDetail = async ({ petId, ...details }: UpdatePetDetailRequest) => {
  return await api
    .post(`pet/update/${petId}`, {
      json: details,
    })
    .json<ApiResponse<PetResponse>>();
};

const getPetList = async () => {
  return await api.get(`pet/list`).json<ApiResponse<PetResponse[]>>();
};

const postUpdatePetRepresentative = async (petId: number) => {
  return await api.post(`pet/representative/${petId}`).json<ApiResponse<PetResponse>>();
};

export {
  postRegisterPet,
  postUpdatePetDetail,
  getPetList,
  postUpdatePetRepresentative,
  type RegisterPetRequest,
  type UpdatePetDetailRequest,
  type PetResponse,
};
