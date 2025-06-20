'use client';

import { RemoveScroll } from 'react-remove-scroll';
import { SearchView } from '@features/search';

// (home)/@modal/(...)search/page.tsx
// 👉 This file is only a route-level entry point for modal-based search.
//    Actual UI logic is managed by @features/search.
//    This is because the search view is a modal and needs to be rendered in a modal.
export default function Page() {
  return (
    <RemoveScroll className='absolute inset-0 z-[100]'>
      <SearchView />
    </RemoveScroll>
  );
}
