export default function StackLayout({ children }: { children: React.ReactNode }) {
  return <div className='h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>{children}</div>;
}
