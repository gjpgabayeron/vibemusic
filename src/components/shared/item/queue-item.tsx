import { Track } from "@/lib/api";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Pause } from "lucide-react";
import { formatDuration } from "@/lib/format";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import { useAudioStore, usePlayerStatus } from "@/stores/audio-store";
import { useNavigationStore } from "@/stores/navigation-store";

interface QueueItemProps {
  track: Track;
  isActive?: boolean;
}

export default function QueueItem({ track, isActive }: QueueItemProps) {
  const removeFromQueue = useAudioStore((s) => s.removeFromQueue);
  const play = useAudioStore((s) => s.play);
  const pause = useAudioStore((s) => s.pause);
  const resume = useAudioStore((s) => s.resume);
  const queue = useAudioStore((s) => s.queue);
  const status = usePlayerStatus();
  const openArtistDetail = useNavigationStore((s) => s.openArtistDetail);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      if (status === "playing") {
        pause();
      } else if (status === "paused") {
        resume();
      } else {
        // Status is "stopped" or "loading" - need to re-play the track
        play(track, queue);
      }
    } else {
      // Play this track from the current queue
      play(track, queue);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.artist_id) {
      openArtistDetail(track.artist_id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          role="button"
          tabIndex={0}
          onClick={handlePlayClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handlePlayClick(e as unknown as React.MouseEvent);
            }
          }}
          className={`flex items-center gap-3 p-2 rounded-md group hover:bg-accent cursor-pointer ${
            isActive ? "bg-accent" : ""
          }`}
        >
          {/* Drag Handle - Always visible now */}
          <div
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity"
          >
            <GripVertical size={16} />
          </div>

          {/* Type/Status Indicator */}
          {
            isActive ? (
              <div className="text-purple-400">
                {status === "playing" ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </div>
            ) : null
            // <div className="w-4 h-4" />
          }

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p
              className={`text-sm font-medium truncate ${
                isActive ? "text-purple-400" : "text-foreground"
              }`}
            >
              {track.title}
            </p>
            {track.artist_id ? (
              <button
                type="button"
                className="text-xs text-muted-foreground truncate hover:text-foreground cursor-pointer text-left"
                onClick={handleArtistClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleArtistClick(e as unknown as React.MouseEvent);
                  }
                }}
              >
                {track.artist}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {formatDuration(track.duration_ms)}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => removeFromQueue(track.id)}>
          Remove from Queue
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
