import { api } from '@shared/api';

interface DeleteMemoRequest {
  targetId: string;
}

async function deleteMemo({ targetId }: DeleteMemoRequest) {
  await api.delete('memo', {
    searchParams: { targetId },
  });
}

export { deleteMemo };
export type { DeleteMemoRequest };
