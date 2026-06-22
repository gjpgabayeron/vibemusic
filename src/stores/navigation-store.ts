import { create } from "zustand";
import { getCurrentWindow, currentMonitor, LogicalSize, PhysicalPosition } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emit, listen } from "@tauri-apps/api/event";
import { useSettingsStore } from "./settings-store";
import { useAudioStore } from "./audio-store";
import { logger } from "@/lib/logger";

// --- Types ---

export type Page =
  | "home"
  | "songs"
  | "albums"
  | "playlists"
  | "artists"
  | "settings"
  | "insights"
  | "about";

export type DetailView =
  | { type: "album"; id: number }
  | { type: "playlist"; id: number }
  | { type: "artist"; id: number }
  | null;

interface NavigationState {
  currentPage: Page;
  detailView: DetailView;
  isSearchOpen: boolean;
  isMiniPlayer: boolean;
}

interface NavigationActions {
  setPage: (page: Page) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  openAlbumDetail: (albumId: number) => void;
  openPlaylistDetail: (playlistId: number) => void;

  openArtistDetail: (artistId: number) => void;
  goBack: () => void;
  toggleMiniPlayer: () => Promise<void>;
}

type NavigationStore = NavigationState & NavigationActions;

// --- Store Implementation ---
/**
 * Store for managing application navigation and UI state (pages, detail views, mini player).
 */
export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial State
  currentPage: "home",
  detailView: null,
  isSearchOpen: false,
  isMiniPlayer: false,

  // Actions
  setPage: (page) => set({ currentPage: page, detailView: null }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  openAlbumDetail: (albumId) =>
    set({ currentPage: "albums", detailView: { type: "album", id: albumId } }),

  openPlaylistDetail: (playlistId) =>
    set({
      currentPage: "playlists",
      detailView: { type: "playlist", id: playlistId },
    }),

  openArtistDetail: (artistId) =>
    set({
      currentPage: "artists",
      detailView: { type: "artist", id: artistId },
    }),

  goBack: () => set({ detailView: null }),

  toggleMiniPlayer: async () => {
    try {
      const state = useNavigationStore.getState();
      const appWindow = getCurrentWindow();
      const settings = useSettingsStore.getState();
      const audioState = useAudioStore.getState();

      if (state.isMiniPlayer) {
        // EXITING - fallback if close listener didn't fire
        logger.debug("Exiting Mini Player via main window...");
        const miniplayer = await WebviewWindow.getByLabel("miniplayer");
        if (miniplayer) {
          try { await miniplayer.hide(); } catch { /* window may already be gone */ }
        }
        await appWindow.show();
        set({ isMiniPlayer: false, isSearchOpen: false });
      } else {
        // ENTERING MINI PLAYER
        logger.debug("Entering Mini Player...");

        let width = 300;
        let height = 360;

        switch (settings.miniPlayerStyle) {
          case "wide":
            width = 400;
            height = 240;
            break;
          case "bar":
            width = 300;
            height = 90;
            break;
          case "square":
          default:
            width = 300;
            height = 360;
            break;
        }

        // Calculate position on current monitor
        const factor = await appWindow.scaleFactor();
        const monitor = await currentMonitor();
        let x = 0;
        let y = 0;

        if (monitor) {
          const padding = 20 * factor;
          const taskbarPadding = 60 * factor;
          const windowWidthPhysical = width * factor;
          const windowHeightPhysical = height * factor;

          const pos = settings.miniPlayerPosition || "bottom-right";

          if (pos.includes("right")) {
            x = Math.round(monitor.size.width - windowWidthPhysical - padding);
          } else {
            x = Math.round(padding);
          }

          if (pos.includes("bottom")) {
            y = Math.round(monitor.size.height - windowHeightPhysical - taskbarPadding);
          } else {
            y = Math.round(padding);
          }
        }

        set({ isMiniPlayer: true });

        // Get the pre-configured miniplayer window from tauri.conf.json
        const miniplayer = await WebviewWindow.getByLabel("miniplayer");
        if (!miniplayer) {
          logger.error("Miniplayer window not found in config");
          set({ isMiniPlayer: false });
          return;
        }

        // Set size and position
        await Promise.all([
          miniplayer.setSize(new LogicalSize(width, height)),
          miniplayer.setPosition(new PhysicalPosition(x, y)),
        ]);

        // Emit current state
        await emit("miniplayer:init", {
          currentTrack: audioState.currentTrack,
          position: audioState.position,
          duration: audioState.duration,
          volume: audioState.volume,
          shuffle: audioState.shuffle,
          repeat: audioState.repeat,
          miniPlayerStyle: settings.miniPlayerStyle,
          miniPlayerPosition: settings.miniPlayerPosition,
        });

        // Show miniplayer, then hide main (sequential to avoid race)
        await miniplayer.show();
        await appWindow.hide();

        // Listen for close/restore from miniplayer
        const unlistenClose = await listen("miniplayer:close", async () => {
          stopMpListeners();
          const mp = await WebviewWindow.getByLabel("miniplayer");
          if (mp) {
            try { await mp.hide(); } catch { /* already hidden */ }
          }
          await appWindow.show();
          set({ isMiniPlayer: false, isSearchOpen: false });
        });

        // Listen for forwarded audio actions from miniplayer
        const unlistenNext = await listen("miniplayer:next", () => {
          useAudioStore.getState().next();
        });

        const unlistenPrev = await listen("miniplayer:previous", () => {
          useAudioStore.getState().previous();
        });

        const unlistenShuffle = await listen<{ shuffle: boolean }>(
          "miniplayer:toggle-shuffle",
          (e) => {
            useAudioStore.setState({ shuffle: e.payload.shuffle });
          },
        );

        const unlistenRepeat = await listen<{ repeat: string }>(
          "miniplayer:toggle-repeat",
          (e) => {
            useAudioStore.setState({ repeat: e.payload.repeat as "off" | "all" | "one" });
          },
        );

        // Auto-close miniplayer when main window gains focus (e.g. tray "Show")
        const unlistenFocus = await appWindow.listen("tauri://focus", async () => {
          if (useNavigationStore.getState().isMiniPlayer) {
            stopMpListeners();
            const mp = await WebviewWindow.getByLabel("miniplayer");
            if (mp) {
              try { await mp.hide(); } catch { /* already hidden */ }
            }
            set({ isMiniPlayer: false, isSearchOpen: false });
          }
        });

        const stopMpListeners = () => {
          unlistenClose();
          unlistenNext();
          unlistenPrev();
          unlistenShuffle();
          unlistenRepeat();
          unlistenFocus();
        };
      }
    } catch (e) {
      logger.error("Failed to toggle Mini Player", e);
      try {
        await getCurrentWindow().show();
      } catch { /* window may already be visible */ }
      set({ isMiniPlayer: false });
    }
  },
}));

// --- Selectors ---
export const useCurrentPage = () => useNavigationStore((s) => s.currentPage);
export const useDetailView = () => useNavigationStore((s) => s.detailView);


