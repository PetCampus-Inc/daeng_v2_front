'use client';

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteOwnerPassTemplate,
  getOwnerPassTemplates,
  postOwnerPassTemplate,
  putOwnerPassTemplate,
} from '../api/ownerPassTemplate';
import { toPassTemplateRequestDto } from '../lib/passTemplate';
import { toOwnerPassTemplate } from './ownerPassTemplateDto';
import type { OwnerPassTemplateInput } from './types';

const ownerPassTemplateQueryKeys = {
  all: ['ownerPassTemplates'] as const,
  list: () => [...ownerPassTemplateQueryKeys.all, 'list'] as const,
} as const;

const createTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ownerPassTemplateQueryKeys.list(),
    queryFn: getOwnerPassTemplates,
    select: (dto) => dto.templates.map(toOwnerPassTemplate),
  });

/** 이용권 템플릿 목록. 수정 화면도 이 목록에서 ID로 항목을 찾는다. */
function useOwnerPassTemplatesQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...createTemplatesQueryOptions(), enabled });
}

function useOwnerPassTemplateMutation() {
  const queryClient = useQueryClient();
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ownerPassTemplateQueryKeys.list() });

  const createMutation = useMutation({
    mutationFn: (input: OwnerPassTemplateInput) => postOwnerPassTemplate(toPassTemplateRequestDto(input)),
    onSuccess: invalidateList,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: OwnerPassTemplateInput }) =>
      putOwnerPassTemplate(id, toPassTemplateRequestDto(input)),
    onSuccess: invalidateList,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOwnerPassTemplate(id),
    // 삭제 후에는 목록으로 바로 이동하므로 갱신이 끝나길 기다리지 않는다.
    onSuccess: () => {
      invalidateList();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}

export {
  createTemplatesQueryOptions,
  ownerPassTemplateQueryKeys,
  useOwnerPassTemplateMutation,
  useOwnerPassTemplatesQuery,
};
