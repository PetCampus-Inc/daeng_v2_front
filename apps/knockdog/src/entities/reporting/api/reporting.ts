import { api } from '@shared/api';

// @TODO API Response, 타입 정의 필요

interface ReportingRequest {
  businessChange?: File[];
  priceChange?: File[];
  hoursChange?: File[];
  phoneChange?: File[];
  address?: string;
}

function postReporting(id: string, params: ReportingRequest) {
  const form = new FormData();

  // File arrays -> multiple parts under the same key
  if (params.businessChange?.length) {
    params.businessChange.forEach((f) => form.append('businessChange', f));
  }
  if (params.priceChange?.length) {
    params.priceChange.forEach((f) => form.append('priceChange', f));
  }
  if (params.hoursChange?.length) {
    params.hoursChange.forEach((f) => form.append('hoursChange', f));
  }
  if (params.phoneChange?.length) {
    params.phoneChange.forEach((f) => form.append('phoneChange', f));
  }
  if (params.address) {
    form.append('address', params.address);
  }

  const multipart = api.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    retry: 0,
  });

  return multipart.post(`api/v0/kindergarten/${id}/change-requests`, {
    body: form,
  });
}

export { postReporting, type ReportingRequest };
