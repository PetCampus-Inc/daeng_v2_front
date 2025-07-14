'use client';

import { RemoveScroll } from 'react-remove-scroll';
import {
  FloatingFocusManager,
  FloatingPortal,
  useFloatingRootContext,
} from '@floating-ui/react';
import { SearchView } from '@features/search';

// (home)/@modal/(...)search/page.tsx
// 👉 This file is only a route-level entry point for modal-based search.
//    Actual UI logic is managed by @features/search.
//    This is because the search view is a modal and needs to be rendered in a modal.
export default function Page() {
  const context = useFloatingRootContext({
    elements: {
      reference: null,
      floating: null,
    },
  });
  return (
    <FloatingPortal>
      <FloatingFocusManager
        context={context}
        modal
        initialFocus={0}
        returnFocus
        outsideElementsInert
      >
        <RemoveScroll className='absolute inset-0 z-[100]'>
          <SearchView />
        </RemoveScroll>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
