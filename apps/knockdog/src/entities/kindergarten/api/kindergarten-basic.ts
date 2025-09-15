import api from '@shared/api/ky-client';
import type { KindergartenBasic } from '../model/kindergarten-basic';

function getKindergartenBasic(id: string): Promise<KindergartenBasic> {
  return api.get(`/api/v0/kindergarten/basic/${id}`).json();
}

export { getKindergartenBasic };
