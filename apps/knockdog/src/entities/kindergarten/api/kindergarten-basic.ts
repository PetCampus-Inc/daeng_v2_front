import type { KindergartenBasic } from '../model/kindergarten-basic';
import { api } from '@shared/api';

export interface KindergartenBasicParams {
  id: string;
}

function getKindergartenBasic(params: KindergartenBasicParams): Promise<KindergartenBasic> {
  return api.get(`kindergarten/basic${params.id}`).json();
}

export { getKindergartenBasic };
