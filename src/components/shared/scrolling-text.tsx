import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
}

export function ScrollingText({
  children,
  className,
  ...props
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(
          textRef.current.scrollWidth > containerRef.current.clientWidth
        );
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden whitespace-nowrap", className)}
      {...props}
    >
      <div
        ref={textRef}
        className={cn(
          "inline-block transition-transform will-change-transform",
          isOverflowing &&
            "motion-safe:hover:animate-scroll-text motion-safe:group-hover:animate-scroll-text motion-safe:group-data-[selected=true]:animate-scroll-text"
        )}
        style={
          isOverflowing
            ? {
                animationDuration: `${Math.min(children.length * 150, 10000)}ms`,
              }
            : undefined
        }
      >
        <span className="inline-block pr-8">{children}</span>
        {isOverflowing && <span aria-hidden="true" className="inline-block pr-8">{children}</span>}
      </div>
    </div>
  );
}
