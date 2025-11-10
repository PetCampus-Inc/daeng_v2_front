'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { RemoveScroll } from 'react-remove-scroll';
import { FloatingFocusManager, FloatingPortal, useFloating } from '@floating-ui/react';
import { SearchPage } from '@views/search-page';
import { SafeArea } from '@shared/ui/safe-area';

// (home)/@modal/(...)search/page.tsx
// 👉 This file is only a route-level entry point for modal-based search.
//    Actual UI logic is managed by @features/search.
//    This is because the search view is a modal and needs to be rendered in a modal.
export default function Page() {
  const pathname = usePathname();
  const { context, refs } = useFloating({
    open: true,
    onOpenChange: () => {},
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // pathname이 /search가 아니면 모달을 렌더링하지 않음
  if (pathname !== '/search') {
    return null;
  }
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
        <RemoveScroll ref={refs.setFloating} className='z-float absolute inset-0'>
          <SafeArea edges={['top']} className='bg-fill-secondary-0 mx-auto h-full max-w-screen-sm'>
            <SearchPage inputRef={searchInputRef} />
          </SafeArea>
        </RemoveScroll>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
