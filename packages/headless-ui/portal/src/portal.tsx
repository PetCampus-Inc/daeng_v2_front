'use client';

import {
  useState,
  useEffect,
  Children,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  disabled?: boolean;
  container?: RefObject<HTMLElement | null>;
}

export function Portal(props: PropsWithChildren<PortalProps>) {
  const { children, disabled, container: containerRef } = props;

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef?.current) {
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      {Children.map(children, (child) =>
        createPortal(child, container ?? document.body)
      )}
    </>
  );
}
Portal.displayName = 'Portal';
