'use client';

import { useRef } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import {
  FloatingFocusManager,
  FloatingPortal,
  useFloating,
} from '@floating-ui/react';
import { SearchView } from '@features/search';

// (home)/@modal/(...)search/page.tsx
// 👉 This file is only a route-level entry point for modal-based search.
//    Actual UI logic is managed by @features/search.
//    This is because the search view is a modal and needs to be rendered in a modal.
export default function Page() {
  const { context, refs } = useFloating({
    open: true,
    onOpenChange: () => {},
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <FloatingPortal>
      <FloatingFocusManager
        context={context}
        initialFocus={searchInputRef}
        modal
        guards
        restoreFocus
        returnFocus
        outsideElementsInert
      >
        <RemoveScroll
          ref={refs.setFloating}
          className='absolute inset-0 z-[100]'
        >
          <SearchView inputRef={searchInputRef} />
        </RemoveScroll>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
