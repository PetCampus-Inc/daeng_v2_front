'use client';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className='flex h-dvh flex-col pt-[env(safe-area-inset-top)]'>{children}</div>;
}
