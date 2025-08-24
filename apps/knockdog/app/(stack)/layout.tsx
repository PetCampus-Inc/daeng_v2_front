'use client';

import { Header, useHeaderContext } from '@widgets/Header';

export default function AuthLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const { title } = useHeaderContext();
  return (
    <>
      <Header>
        <Header.Title>{title}</Header.Title>
      </Header>
      {children}
      {modal}
    </>
  );
}
