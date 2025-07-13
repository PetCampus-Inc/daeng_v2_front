'use client';

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
        <Header.CloseButton />
      </Header.RightSection>
    </Header>
  );
}

// 사용예시
