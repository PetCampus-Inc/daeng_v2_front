import { ReferencePointType } from '@entities/compare';

interface FilterState {
  refPoint: ReferencePointType;
  showMemoOnly: boolean;
  onChangeRefPoint: (refPoint: ReferencePointType) => void;
  onMemoToggle: () => void;
}

export type { FilterState };
