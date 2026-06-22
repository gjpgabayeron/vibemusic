import { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { ArtworkImage } from "@/components/shared/artwork-image";
import { MediaContextMenu } from "@/components/shared/media-context-menu";

const cardVariants = cva(
  "flex flex-col cursor-pointer transition-colors group relative",
  {
    variants: {
      variant: {
        portrait: "rounded-lg p-3 hover:bg-accent",
        landscape: "flex-row gap-4 p-2 hover:bg-accent rounded-md items-center",
        compact: "w-40 shrink-0 space-y-3",
        circle: "rounded-lg p-3 hover:bg-accent items-center", // For artists
      },
    },
    defaultVariants: {
      variant: "portrait",
    },
  },
);

const imageVariants = cva("relative bg-card overflow-hidden shadow-sm", {
  variants: {
    variant: {
      portrait: "aspect-square w-full rounded-lg mb-3",
      landscape: "w-12 h-12 rounded-md shrink-0",
      compact: "aspect-square w-full rounded-xl",
      circle: "aspect-square w-full rounded-full mb-3",
    },
  },
  defaultVariants: {
    variant: "portrait",
  },
});

interface EntityCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "contextMenu">,
    VariantProps<typeof cardVariants> {
  title: string;
  subtitle?: string;
  tertiaryText?: string;
  artworkSrc?: string;
  rank?: number;
  onPlay?: () => void;
  onClick?: () => void;
  /** Context menu actions */
  menuActions?: {
    onPlay?: () => void;
    onShuffle?: () => void;
    onPlayNext?: () => void;
    onAddToQueue?: () => void;
  };
}

export const EntityCard = memo(function EntityCard({
  title,
  subtitle,
  tertiaryText,
  artworkSrc,
  variant,
  rank,
  className,
  onPlay,
  onClick,
  menuActions,
  ...props
}: EntityCardProps) {
  const CardContent = (
    <div
      role="button"
      tabIndex={0}
      className={cn(cardVariants({ variant, className }))}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      {...props}
    >
      <div className={cn(imageVariants({ variant }), "overflow-visible")}>
        <div className="relative w-full h-full rounded-[inherit] overflow-hidden">
          <ArtworkImage
            src={artworkSrc}
            alt={title}
            className="group-hover:scale-[1.02] transition-transform duration-300"
          />
          {onPlay && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <button
                type="button"
                aria-label="Play"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
              >
                <Play fill="currentColor" className="ml-1" size={20} />
              </button>
            </div>
          )}
        </div>
        {rank !== undefined && (
          <div className="absolute -top-1 -left-1 bg-black/60 backdrop-blur-md text-white shadow-sm rounded-full w-6 h-6 flex items-center justify-center font-bold text-[10px] z-20 ring-1 ring-white/20">
            {rank}
          </div>
        )}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 w-full",
          variant === "circle" && "text-center",
        )}
      >
        <div className="font-bold text-sm truncate leading-tight">{title}</div>
        {subtitle && (
          <div className="text-muted-foreground text-xs truncate mt-0.5">
            {subtitle}
          </div>
        )}
        {tertiaryText && variant !== "compact" && (
          <div className="text-muted-foreground text-[10px] truncate mt-0.5">
            {tertiaryText}
          </div>
        )}
      </div>
    </div>
  );

  if (menuActions) {
    return <MediaContextMenu {...menuActions}>{CardContent}</MediaContextMenu>;
  }

  return CardContent;
});
