function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`m-2 text-lg font-bold ${className}`}>{children}</h2>;
}

export { Title };
