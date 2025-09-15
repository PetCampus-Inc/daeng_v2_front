import { api } from '@shared/api';
import type { KindergartenBasic } from '../model/kindergarten-basic';

// @TODO API Response, 타입 정의 필요

function getKindergartenBasic(id: string): Promise<KindergartenBasic> {
  return api.get(`/api/v0/kindergarten/basic/${id}`).json();
}

export { getKindergartenBasic };
