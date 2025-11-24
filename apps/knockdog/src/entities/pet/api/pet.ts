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
  breed?: string;
  birthYear?: number;
  gender?: Gender;
  isNeutered?: boolean;
  weight?: number;
}

const postUpdatePetDetail = async ({ petId, ...details }: UpdatePetDetailRequest) => {
  return await api
    .post(`pet/detail/update/${petId}`, {
      json: details,
    })
    .json<ApiResponse<PetResponse>>();
};

export { postRegisterPet, postUpdatePetDetail, type RegisterPetRequest, type UpdatePetDetailRequest, type PetResponse };
