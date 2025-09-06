import { BottomNavBar } from '@widgets/bottom-nav-bar';

export default function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
      <BottomNavBar />
    </>
  );
}
