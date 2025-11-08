'use client';

import { useRef } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { FloatingFocusManager, FloatingPortal, useFloating } from '@floating-ui/react';
import { SearchPage } from '@views/search-page';
import { useSafeAreaInsets } from '@shared/lib';

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
  const { top } = useSafeAreaInsets();
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
        <RemoveScroll ref={refs.setFloating} className='absolute inset-0 z-[100]'>
          <div className='bg-fill-secondary-0 flex h-full flex-col' style={{ paddingTop: top }}>
            <SearchPage inputRef={searchInputRef} />
          </div>
        </RemoveScroll>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
