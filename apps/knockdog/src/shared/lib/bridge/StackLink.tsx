'use client';

import Link from 'next/link';
import { Url } from 'next/dist/shared/lib/router/router';
import { Slot } from '@knockdog/ui';
import { isNativeWebView } from '@shared/lib/device';
import { useStackNavigation } from './useStackNavigation';
import { useEffect, useState } from 'react';

interface StackLinkProps {
  href: Url;
  children?: React.ReactNode;
  asChild?: boolean;
}

function StackLink({ href, children, asChild = true, ...props }: StackLinkProps) {
  const { push } = useStackNavigation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLink = () => {
    if (typeof href === 'string') push({ pathname: href });
  };

  if (mounted && isNativeWebView()) {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp type='button' onClick={handleLink}>
        {children}
      </Comp>
    );
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

export { StackLink };
