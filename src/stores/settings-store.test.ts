import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "./settings-store";

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  mockInvoke.mockReset();
  useSettingsStore.setState({
    currentProfileId: "test-profile",
    sidebarItems: [
      { id: "home", hidden: false },
      { id: "search", hidden: false },
      { id: "songs", hidden: false },
      { id: "albums", hidden: false },
      { id: "playlists", hidden: false },
      { id: "artists", hidden: false },
      { id: "insights", hidden: false },
      { id: "settings", hidden: false },
    ],
    songsSortKey: "title",
    songsSortDirection: "asc",
    albumsSortKey: "title",
    albumsSortDirection: "asc",
    artistsSortKey: "name",
    artistsSortDirection: "asc",
    crossfadeDuration: 0,
    miniPlayerStyle: "square",
    miniPlayerPosition: "bottom-right",
    theme: "dark",
    isLoading: false,
  });
});

describe("settings-store", () => {
  it("has default sort settings", () => {
    const s = useSettingsStore.getState();
    expect(s.songsSortKey).toBe("title");
    expect(s.songsSortDirection).toBe("asc");
    expect(s.crossfadeDuration).toBe(0);
    expect(s.theme).toBe("dark");
  });

  it("setSongsSort updates sort key and direction", () => {
    useSettingsStore.getState().setSongsSort("artist", "desc");
    const s = useSettingsStore.getState();
    expect(s.songsSortKey).toBe("artist");
    expect(s.songsSortDirection).toBe("desc");
  });

  it("setAlbumsSort updates album sort", () => {
    useSettingsStore.getState().setAlbumsSort("year", "desc");
    const s = useSettingsStore.getState();
    expect(s.albumsSortKey).toBe("year");
    expect(s.albumsSortDirection).toBe("desc");
  });

  it("setArtistsSort updates artist sort", () => {
    useSettingsStore.getState().setArtistsSort("name", "desc");
    const s = useSettingsStore.getState();
    expect(s.artistsSortKey).toBe("name");
    expect(s.artistsSortDirection).toBe("desc");
  });

  it("setCrossfadeDuration calls invoke", async () => {
    mockInvoke.mockResolvedValue(undefined);
    await useSettingsStore.getState().setCrossfadeDuration(2000);
    expect(mockInvoke).toHaveBeenCalledWith("audio_set_crossfade", { durationMs: 2000 });
  });
});
