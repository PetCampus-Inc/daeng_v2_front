import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요

interface ReportingRequest {
  businessChange?: string[];
  priceChange?: string[];
  hoursChange?: string[];
  phoneChange?: string[];
  address?: string;
}

function postReporting(id: string, params: ReportingRequest) {
  return api.post(`kindergarten/${id}/change-requests`, {
    json: params,
  });
}

export { postReporting, type ReportingRequest };
