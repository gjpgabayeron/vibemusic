import { Button } from "@/components/ui/button";
import { Logs, Mic2, Info, SquareArrowOutUpRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidePanelActionsProps {
  sidePanel: string;
  onToggleQueue: () => void;
  onSetSidePanel: (panel: "none" | "queue" | "track-details" | "lyrics") => void;
  onToggleMiniPlayer: () => void;
}

export function SidePanelActions({ sidePanel, onToggleQueue, onSetSidePanel, onToggleMiniPlayer }: SidePanelActionsProps) {
  return (
    <div className="flex items-center">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button id="queue-menu-button" variant="ghost" onClick={onToggleQueue}
            className={sidePanel === "queue" ? "text-purple-500 hover:text-purple-400" : ""}
          >
            <Logs size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Queue</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button id="lyrics-button" variant="ghost"
            onClick={() => onSetSidePanel(sidePanel === "lyrics" ? "none" : "lyrics")}
            className={sidePanel === "lyrics" ? "text-purple-500 hover:text-purple-400" : ""}
          >
            <Mic2 size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Lyrics</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button id="info-button" variant="ghost"
            onClick={() => onSetSidePanel(sidePanel === "track-details" ? "none" : "track-details")}
            className={sidePanel === "track-details" ? "text-purple-500 hover:text-purple-400" : ""}
          >
            <Info size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Track Details</TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={onToggleMiniPlayer} className="text-muted-foreground hover:text-foreground">
            <SquareArrowOutUpRight size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mini Player</TooltipContent>
      </Tooltip>
    </div>
  );
}
