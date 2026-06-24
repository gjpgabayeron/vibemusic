import { Switch } from "@/components/ui/switch";
import { Settings, Power, HardDrive } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";

export function SettingsGeneral() {
  const closeToTray = useSettingsStore((s) => s.closeToTray);
  const setCloseToTray = useSettingsStore((s) => s.setCloseToTray);
  const scanOnStartup = useSettingsStore((s) => s.scanOnStartup);
  const setScanOnStartup = useSettingsStore((s) => s.setScanOnStartup);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">General</h2>
      </div>

      <div className="grid gap-6">
        {/* Close to Tray */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-muted-foreground" />
              <div className="font-medium">Close to Tray</div>
            </div>
            <div className="text-sm text-muted-foreground pl-6">
              Closing the window minimizes to tray. When music is playing, a dialog will ask whether to minimize or quit.
            </div>
          </div>
          <Switch checked={closeToTray} onCheckedChange={setCloseToTray} />
        </div>

        {/* Scan on Startup */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div className="font-medium">Scan on Startup</div>
            </div>
            <div className="text-sm text-muted-foreground pl-6">
              Automatically scan library folders when app starts
            </div>
          </div>
          <Switch checked={scanOnStartup} onCheckedChange={setScanOnStartup} />
        </div>

      </div>
    </div>
  );
}
