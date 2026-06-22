import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppDialogsProps {
  isQuitDialogOpen: boolean;
  setIsQuitDialogOpen: (open: boolean) => void;
  onConfirmQuit: () => void;
  isCloseToTrayDialogOpen: boolean;
  setIsCloseToTrayDialogOpen: (open: boolean) => void;
  onConfirmCloseToTrayHide: () => void;
  showProfileSwitchWarning: boolean;
  setShowProfileSwitchWarning: (open: boolean) => void;
  confirmProfileSwitch: () => void;
  isRefreshWarningOpen: boolean;
  setIsRefreshWarningOpen: (open: boolean) => void;
  handleConfirmRefresh: () => void;
}

export function AppDialogs({
  isQuitDialogOpen,
  setIsQuitDialogOpen,
  onConfirmQuit,
  isCloseToTrayDialogOpen,
  setIsCloseToTrayDialogOpen,
  onConfirmCloseToTrayHide,
  showProfileSwitchWarning,
  setShowProfileSwitchWarning,
  confirmProfileSwitch,
  isRefreshWarningOpen,
  setIsRefreshWarningOpen,
  handleConfirmRefresh,
}: AppDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={isQuitDialogOpen}
        onOpenChange={setIsQuitDialogOpen}
        title="Are you sure you want to quit?"
        description='Playback will stop. You can enable "Close to Tray" in settings to keep music playing in the background.'
        confirmText="Quit"
        variant="destructive"
        onConfirm={onConfirmQuit}
      />
      <ConfirmDialog
        open={isCloseToTrayDialogOpen}
        onOpenChange={setIsCloseToTrayDialogOpen}
        title="Keep Playing in Background?"
        description="Music is currently playing. Minimize to tray to keep playback active in the background, or stop playback and quit the app."
        confirmText="Minimize to Tray"
        cancelText="Stop & Quit"
        variant="primary"
        onConfirm={onConfirmCloseToTrayHide}
        onCancel={onConfirmQuit}
      />
      <ConfirmDialog
        open={showProfileSwitchWarning}
        onOpenChange={setShowProfileSwitchWarning}
        title="Stop Playback?"
        description="Switching profiles will stop the current playback. Do you want to continue?"
        confirmText="Switch Profile"
        onConfirm={confirmProfileSwitch}
      />
      <AlertDialog
        open={isRefreshWarningOpen}
        onOpenChange={setIsRefreshWarningOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Playback and Refresh?</AlertDialogTitle>
            <AlertDialogDescription>
              Refreshing the app will stop the current playback. Are you sure
              you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRefresh}>
              Refresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </>
  );
}
