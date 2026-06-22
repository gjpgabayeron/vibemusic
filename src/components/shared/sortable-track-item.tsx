import { Track } from "@/lib/api";
import { useCurrentTrack } from "@/stores/audio-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicListItem from "@/components/shared/item/music-list";

interface SortableTrackItemProps {
  track: Track;
  index: number;
  onRemove: (e: React.MouseEvent) => void;
}

export function SortableTrackItem({ track, index, onRemove }: SortableTrackItemProps) {
  const currentTrack = useCurrentTrack();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const isCurrentTrack = currentTrack?.id === track.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 hover:bg-accent/50 rounded-md pr-2 transition-colors ${
        isDragging ? "bg-accent shadow-xl" : ""
      } ${
        isCurrentTrack && !isDragging
          ? "bg-accent/50 outline outline-border"
          : ""
      }`}
    >
      <div
        className="w-12 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <span className="text-sm font-variant-numeric tabular-nums group-hover:hidden">
          {index + 1}
        </span>
        <GripVertical size={16} className="hidden group-hover:block" />
      </div>

      <div className="flex-1 min-w-0">
        <MusicListItem track={track} disableHover />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        title="Remove from playlist"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
