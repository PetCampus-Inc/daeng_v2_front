export default function StackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>스택 헤더</div>
      {children}
    </div>
  );
}
