import { BottomNavBar } from '@widgets/bottom-nav-bar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className='web:[--bottom-bar-height:calc(var(--bottom-nav-content-height)+var(--bottom-nav-inset))] flex min-h-0 flex-1 flex-col'>
        {children}
      </main>
      <BottomNavBar />
    </>
  );
}
