import { api } from '@shared/api';
import type { KindergartenBasic } from '../model/kindergarten-basic';

function getKindergartenBasic(id: string): Promise<KindergartenBasic> {
  return api.get(`kindergarten/basic/${id}`).json();
}

export { getKindergartenBasic };
