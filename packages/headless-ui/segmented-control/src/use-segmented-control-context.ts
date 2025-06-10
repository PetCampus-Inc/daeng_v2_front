import { createContext, useContext } from 'react';
import type {
  UseSegmentedControlReturn,
  UseSegmentedControlItemProps,
} from './use-segmented-control';

interface UseSegmentedControlContext extends UseSegmentedControlReturn {}

const SegmentedControlContext =
  createContext<UseSegmentedControlContext | null>(null);

function useSegmentedControlContext() {
  const context = useContext(SegmentedControlContext);
  if (!context) {
    throw new Error(
      'useSegmentedControlContext must be used within SegmentedControl'
    );
  }
  return context;
}

interface UseSegmentedControlItemContext extends UseSegmentedControlItemProps {}

const SegmentedControlItemContext =
  createContext<UseSegmentedControlItemContext | null>(null);

function useSegmentedControlItemContext() {
  const context = useContext(SegmentedControlItemContext);
  if (!context) {
    throw new Error(
      'useSegmentedControlItemContext must be used within SegmentedControlItem'
    );
  }
  return context;
}

export {
  SegmentedControlContext,
  useSegmentedControlContext,
  SegmentedControlItemContext,
  useSegmentedControlItemContext,
};
export type { UseSegmentedControlContext, UseSegmentedControlItemContext };
