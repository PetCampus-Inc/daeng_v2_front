import { api } from '@shared/api';
import type { WebImageAsset } from '@shared/lib/media';

// @TODO API Response, 타입 정의 필요

interface ReportingRequest {
  businessChange?: WebImageAsset[];
  priceChange?: WebImageAsset[];
  hoursChange?: WebImageAsset[];
  phoneChange?: WebImageAsset[];
  address?: string;
}

/**
 * WebImageAsset을 FormData에 추가
 * useImagePicker에서 이미 File 또는 Blob으로 변환된 formValue를 사용
 */
function appendImageAssets(form: FormData, fieldName: string, assets: WebImageAsset[]) {
  assets.forEach((asset) => {
    // formValue는 이미 File 또는 Blob 형태
    // fileName이 있으면 사용하고, 없으면 기본값
    const fileName = asset.fileName || `image-${Date.now()}.jpg`;
    form.append(fieldName, asset.formValue, fileName);
  });
}

function postReporting(id: string, params: ReportingRequest) {
  const form = new FormData();

  // 이미지 필드 처리
  const imageFields: Array<keyof Pick<ReportingRequest, 'businessChange' | 'priceChange' | 'hoursChange' | 'phoneChange'>> = [
    'businessChange',
    'priceChange',
    'hoursChange',
    'phoneChange',
  ];

  imageFields.forEach((field) => {
    const assets = params[field];
    if (assets?.length) {
      appendImageAssets(form, field, assets);
    }
  });

  // 텍스트 필드 처리
  if (params.address) {
    form.append('address', params.address);
  }

  return api.post(`kindergarten/${id}/change-requests`, {
    body: form,
    headers: {
      // FormData 사용 시 Content-Type을 명시하지 않아야 브라우저/네이티브가 자동으로 multipart/form-data + boundary 설정
      // @ts-ignore
      'Content-Type': undefined,
    },
  });
}

export { postReporting, type ReportingRequest };
