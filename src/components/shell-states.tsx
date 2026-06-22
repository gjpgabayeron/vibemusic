import { TitleBar } from "./titlebar";
import { AppDialogs } from "./app-dialogs";
import ProfileSelectionPage from "@/pages/profile-selection-page";

interface ShellStatesProps {
  isProfilesLoading: boolean;
  activeProfileId: string | null;
  isQuitDialogOpen: boolean;
  setIsQuitDialogOpen: (open: boolean) => void;
  showProfileSwitchWarning: boolean;
  setShowProfileSwitchWarning: (open: boolean) => void;
  confirmProfileSwitch: () => Promise<void>;
  isRefreshWarningOpen: boolean;
  setIsRefreshWarningOpen: (open: boolean) => void;
  handleConfirmRefresh: () => Promise<void>;
}

export function ShellStates({
  isProfilesLoading,
  activeProfileId,
  isQuitDialogOpen,
  setIsQuitDialogOpen,
  showProfileSwitchWarning,
  setShowProfileSwitchWarning,
  confirmProfileSwitch,
  isRefreshWarningOpen,
  setIsRefreshWarningOpen,
  handleConfirmRefresh,
}: ShellStatesProps) {
  if (isProfilesLoading) {
    return (
      <div className="h-screen w-screen bg-background text-foreground relative flex flex-col">
        <TitleBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-foreground/10" />
            <div className="w-32 h-4 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div className="h-screen w-screen bg-background text-foreground relative flex flex-col">
        <TitleBar />
        <div className="flex-1 overflow-hidden">
          <ProfileSelectionPage />
        </div>
        <AppDialogs
          isQuitDialogOpen={isQuitDialogOpen}
          setIsQuitDialogOpen={setIsQuitDialogOpen}
          showProfileSwitchWarning={showProfileSwitchWarning}
          setShowProfileSwitchWarning={setShowProfileSwitchWarning}
          confirmProfileSwitch={confirmProfileSwitch}
          isRefreshWarningOpen={isRefreshWarningOpen}
          setIsRefreshWarningOpen={setIsRefreshWarningOpen}
          handleConfirmRefresh={handleConfirmRefresh}
        />
      </div>
    );
  }

  return null;
}
