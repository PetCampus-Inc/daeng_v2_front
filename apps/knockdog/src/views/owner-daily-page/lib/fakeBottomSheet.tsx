import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';

/**
 * 컴포넌트 테스트용 가짜 바텀시트.
 * 실제 BottomSheet(@daeng-design/vaul)는 패키지가 각자 React 18을 읽어 jsdom 테스트에서 열 수 없어서 쓴다.
 * 열림·닫힘만 흉내 낸다: 열려 있을 때만 그리고, 딤 영역이나 닫기 버튼을 누르면 `onOpenChange(false)`를 부른다.
 *
 * 사용법: vi.mock('@shared/ui/bottom-sheet', async () => ({ BottomSheet: await import('@views/owner-daily-page/lib/fakeBottomSheet') }));
 */

const OpenChangeContext = createContext<(open: boolean) => void>(() => {});

const Root = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}) => {
  if (!open) return null;

  return <OpenChangeContext.Provider value={(next) => onOpenChange?.(next)}>{children}</OpenChangeContext.Provider>;
};

const Overlay = ({ className }: { className?: string }) => {
  const onOpenChange = useContext(OpenChangeContext);

  return <div data-slot='bottom-sheet-overlay' className={className} onClick={() => onOpenChange(false)} />;
};

const Body = ({ children, className }: ComponentProps<'div'>) => (
  <div role='dialog' className={className}>
    {children}
  </div>
);

const Plain = ({ children, className }: ComponentProps<'div'>) => <div className={className}>{children}</div>;

const Title = ({ children }: ComponentProps<'h2'>) => <h2>{children}</h2>;

const CloseButton = ({ onClick, ...props }: ComponentProps<'button'>) => {
  const onOpenChange = useContext(OpenChangeContext);

  return (
    <button
      type='button'
      {...props}
      onClick={(event) => {
        onClick?.(event);
        onOpenChange(false);
      }}
    />
  );
};

export { Body, CloseButton, Overlay, Plain as Handle, Plain as Header, Plain as Content, Plain as Footer, Root, Title };
