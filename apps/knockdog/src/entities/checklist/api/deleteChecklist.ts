import { api } from '@shared/api';

interface DeleteChecklistRequest {
  targetId: string;
}

async function deleteChecklist({ targetId }: DeleteChecklistRequest) {
  await api.delete('memo/checklist', {
    searchParams: { targetId },
  });
}

export { deleteChecklist };
export type { DeleteChecklistRequest };
