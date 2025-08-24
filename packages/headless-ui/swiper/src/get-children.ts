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

function isSwiperNavigation(child: React.ReactNode) {
  if (!React.isValidElement(child)) {
    return false;
  }

  // displayName 체크
  if (child.type && (child.type as any).displayName === 'SwiperNavigation') {
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

function getSwiperNavigation(children: React.ReactNode) {
  let navigation: React.ReactNode | null = null;

  React.Children.forEach(children, (child) => {
    if (isSwiperNavigation(child)) {
      navigation = child;
    }
  });

  return navigation;
}

export { getChildren, getSwiperNavigation };
