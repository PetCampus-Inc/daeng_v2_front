import type {
  LegalDocumentDetailDto,
  LegalDocumentType,
  LegalDocumentVersionListDto,
  PlatformNoticeDetailDto,
  PlatformNoticePageDto,
} from '../model/platformContent';

import { api, ApiError, type ApiResponse } from '@shared/api';

const PLATFORM_NOTICES_PAGE_SIZE = 20;

function getPlatformNotices({ cursor, size = PLATFORM_NOTICES_PAGE_SIZE }: { cursor?: string; size?: number } = {}) {
  return api
    .get('notices', {
      searchParams: { size, ...(cursor ? { cursor } : {}) },
    })
    .json<ApiResponse<PlatformNoticePageDto>>();
}

async function getPlatformNoticeDetail(id: number) {
  try {
    return await api.get(`notices/${id}`).json<ApiResponse<PlatformNoticeDetailDto>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: 404, code: 'NOT_FOUND', message: '', data: null } satisfies ApiResponse<PlatformNoticeDetailDto | null>;
    }
    throw error;
  }
}

function getLegalDocumentVersions(type: LegalDocumentType) {
  return api.get(`legal-documents/${type}/versions`).json<ApiResponse<LegalDocumentVersionListDto>>();
}

async function getLegalDocumentDetail(type: LegalDocumentType, versionId?: number) {
  try {
    return await api
      .get(`legal-documents/${type}`, {
        searchParams: versionId == null ? undefined : { versionId },
      })
      .json<ApiResponse<LegalDocumentDetailDto>>();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: 404, code: 'NOT_FOUND', message: '', data: null } satisfies ApiResponse<LegalDocumentDetailDto | null>;
    }
    throw error;
  }
}

export {
  getLegalDocumentDetail,
  getLegalDocumentVersions,
  getPlatformNoticeDetail,
  getPlatformNotices,
  PLATFORM_NOTICES_PAGE_SIZE,
};
