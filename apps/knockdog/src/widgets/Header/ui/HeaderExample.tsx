'use client';

import { ComponentProps, useContext, createContext } from 'react';
import { Header } from './Header';

type HeaderWrapperProps = {
  title: string;
};

export default function HeaderWrapper({ title }: HeaderWrapperProps) {
  return (
    <Header>
      <Header.BackButton />

      <Header.Title>{title}</Header.Title>

      <Header.RightSection>
        <Header.ShareButton />
        <Header.MenuButton />
      </Header.RightSection>
    </Header>
  );
}

// 사용예시
