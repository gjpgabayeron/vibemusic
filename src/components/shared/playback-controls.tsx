import { Button } from "@/components/ui/button";
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaybackControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  onToggleShuffle: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onToggleRepeat: () => void;
}

export function PlaybackControls({
  isPlaying,
  shuffle,
  repeat,
  onToggleShuffle,
  onPrevious,
  onPlayPause,
  onNext,
  onToggleRepeat,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={onToggleShuffle}
            className={shuffle ? "text-purple-500 hover:text-purple-400" : ""}
          >
            <Shuffle size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Shuffle {shuffle ? "On" : "Off"}</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={onPrevious}>
            <SkipBack size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button size="icon-lg" variant="ghost" onClick={onPlayPause}>
            {isPlaying ? (
              <Pause className="fill-white" />
            ) : (
              <Play className="fill-white ml-0.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={onNext}>
            <SkipForward size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={onToggleRepeat}
            className={repeat !== "off" ? "text-purple-500 hover:text-purple-400" : ""}
          >
            {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Repeat {repeat === "off" ? "Off" : repeat === "all" ? "All" : "One"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
