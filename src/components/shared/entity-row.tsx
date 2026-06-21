import { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArtworkImage } from "@/components/shared/artwork-image";
import { ScrollingText } from "@/components/shared/scrolling-text";
import { Play, Pause } from "lucide-react";

const rowVariants = cva(
  "group flex items-center gap-3 rounded-md p-2 transition-colors cursor-default select-none relative",
  {
    variants: {
      variant: {
        default: "hover:bg-accent/50",
        compact: "hover:bg-accent/50",
        detailed: "hover:bg-accent/50 p-2",
      },
      active: {
        true: "bg-accent/50 text-accent-foreground outline outline-1 outline-border",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      active: false,
    },
  },
);

interface EntityRowProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "contextMenu" | "title">,
    VariantProps<typeof rowVariants> {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  artworkSrc?: string;
  index?: number;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Optional context menu wrapper component */
  contextMenuWrapper?: React.ReactNode;
  showArtwork?: boolean;
  playing?: boolean;
  artworkCircular?: boolean;
  artworkFallback?: string;
}

export const EntityRow = memo(function EntityRow({
  title,
  subtitle,
  artworkSrc,
  index,
  leading,
  trailing,
  variant,
  active,
  className,
  showArtwork = true,
  playing = false,
  artworkCircular,
  artworkFallback,
  contextMenuWrapper: _contextMenuWrapper, // Destructure to avoid passing to div
  ...props
}: EntityRowProps) {
  return (
    <div
      className={cn(rowVariants({ variant, active, className }))}
      data-active={active}
      {...props}
    >
      {/* Leading Section (Index or Icon) */}
      <div className="w-8 flex justify-center shrink-0 text-muted-foreground text-sm font-variant-numeric tabular-nums">
        {!active ? (
          <>
            {/* Default State: Show Leading/Index (Hidden on Hover) */}
            <span className="group-hover:hidden">{leading || index}</span>

            {/* Hover State: Show Play */}
            <span className="hidden group-hover:block text-foreground">
              <Play size={16} fill="currentColor" />
            </span>
          </>
        ) : (
          <>
            {/* Active Normal: Play (Primary color). No AudioLines. */}
            <span
              className={cn(
                "group-hover:hidden",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Pause size={16} fill="currentColor" />
            </span>

            {/* Active Hover: Pause (if playing) or Play (if paused/inactive) */}
            <span className="hidden group-hover:block text-foreground">
              {active && playing ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </span>
          </>
        )}
      </div>

      {/* Artwork Section */}
      {showArtwork && (
        <div className="relative shrink-0">
          <ArtworkImage
            src={artworkSrc}
            alt={typeof title === "string" ? title : "Artwork"}
            fallback={artworkFallback}
            className={cn(
              "w-10 h-10 object-cover bg-secondary",
              artworkCircular ? "rounded-full" : "rounded shadow-sm",
            )}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div
          className={cn(
            "text-sm font-medium truncate",
            active && "text-primary",
            "w-full",
          )}
        >
          {typeof title === "string" ? (
            <ScrollingText>{title}</ScrollingText>
          ) : (
            title
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {subtitle}
          </div>
        )}
      </div>

      {/* Trailing Section */}
      {trailing && (
        <div className="flex items-center gap-2 shrink-0 text-muted-foreground text-sm">
          {trailing}
        </div>
      )}
    </div>
  );
});
