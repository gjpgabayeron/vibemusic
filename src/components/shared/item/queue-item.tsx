import { useEffect, useRef, useState } from "react";
import { Track } from "@/lib/api";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Pause } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { ScrollingText } from "@/components/shared/scrolling-text";
import { ArtistLinks } from "@/components/shared/artist-links";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import { useAudioStore, usePlayerStatus } from "@/stores/audio-store";

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
  const artistContainerRef = useRef<HTMLDivElement>(null);
  const artistContentRef = useRef<HTMLDivElement>(null);
  const [artistOverflows, setArtistOverflows] = useState(false);

  useEffect(() => {
    const check = () => {
      if (artistContainerRef.current && artistContentRef.current) {
        setArtistOverflows(
          artistContentRef.current.scrollWidth > artistContainerRef.current.clientWidth
        );
      }
    };
    check();
    const observer = new ResizeObserver(check);
    if (artistContainerRef.current) {
      observer.observe(artistContainerRef.current);
    }
    return () => observer.disconnect();
  }, [track.artist_names, track.artist]);

  const artistText = track.artist_names.join(", ") || track.artist || "";

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
        play(track, queue);
      }
    } else {
      play(track, queue);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          type="button"
          ref={setNodeRef}
          style={style}
          onClick={handlePlayClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handlePlayClick(e as unknown as React.MouseEvent);
            }
          }}
          className={`flex items-center gap-3 p-2 rounded-md group hover:bg-accent cursor-pointer w-full text-left ${
            isActive ? "bg-accent" : ""
          }`}
        >
          {/* Drag Handle - Always visible now */}
          <div
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity shrink-0"
          >
            <GripVertical size={16} />
          </div>

          {/* Type/Status Indicator */}
          {
            isActive ? (
              <div className="text-purple-400 shrink-0">
                {status === "playing" ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </div>
            ) : null
          }

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div
              className={`text-sm font-medium w-full ${
                isActive ? "text-purple-400" : "text-foreground"
              }`}
            >
              <ScrollingText>{track.title}</ScrollingText>
            </div>
            <div
              ref={artistContainerRef}
              className="relative overflow-hidden whitespace-nowrap text-xs text-muted-foreground w-full"
            >
              <div
                ref={artistContentRef}
                className={cn(
                  "inline-block transition-transform will-change-transform",
                  artistOverflows && "motion-safe:hover:animate-scroll-text motion-safe:group-hover:animate-scroll-text",
                )}
                style={
                  artistOverflows
                    ? { animationDuration: `${Math.min(artistText.length * 150, 10000)}ms` }
                    : undefined
                }
              >
                <span className="inline-block pr-8">
                  <ArtistLinks
                    names={track.artist_names}
                    ids={track.artist_ids}
                    fallbackName={track.artist}
                    fallbackId={track.artist_id}
                  />
                </span>
                {artistOverflows && (
                  <span aria-hidden="true" className="inline-block pr-8">
                    <ArtistLinks
                      names={track.artist_names}
                      ids={track.artist_ids}
                      fallbackName={track.artist}
                      fallbackId={track.artist_id}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono shrink-0">
            {formatDuration(track.duration_ms)}
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => removeFromQueue(track.id)}>
          Remove from Queue
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
