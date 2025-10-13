import { BottomNavBar } from '@widgets/bottom-nav-bar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  );
}
