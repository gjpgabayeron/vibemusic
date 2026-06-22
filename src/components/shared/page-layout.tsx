import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  overflowHidden?: boolean;
  className?: string;
}

export function PageLayout({ children, overflowHidden = false, className }: PageLayoutProps) {
  return (
    <div className={cn("flex-1 min-w-0 h-full flex flex-col", overflowHidden && "overflow-hidden", className)}>
      {children}
    </div>
  );
}
