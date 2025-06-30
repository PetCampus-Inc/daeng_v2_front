import * as React from 'react';

function isSwiperSlideItem(child: React.ReactNode) {
  if (!React.isValidElement(child)) {
    return false;
  }

  // displayName 체크
  if (child.type && (child.type as any).displayName === 'SwiperSlideItem') {
    return true;
  }

  return false;
}

function getChildren(children: React.ReactNode) {
  const slides: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (isSwiperSlideItem(child)) {
      slides.push(child);
    }
  });

  return slides;
}

export { getChildren };
