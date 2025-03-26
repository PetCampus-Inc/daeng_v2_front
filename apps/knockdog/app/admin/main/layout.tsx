export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>어드민 메인 헤더</header>
      <main>{children}</main>
      <nav>어드민 네비바</nav>
    </div>
  );
}
