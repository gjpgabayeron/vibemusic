import { describe, it, expect, beforeEach } from "vitest";
import { useNavigationStore } from "./navigation-store";

beforeEach(() => {
  useNavigationStore.setState({
    currentPage: "home",
    detailView: null,
    isSearchOpen: false,
    isMiniPlayer: false,
  });
});

describe("navigation-store", () => {
  it("has correct initial state", () => {
    const state = useNavigationStore.getState();
    expect(state.currentPage).toBe("home");
    expect(state.detailView).toBeNull();
    expect(state.isSearchOpen).toBe(false);
    expect(state.isMiniPlayer).toBe(false);
  });

  describe("setPage", () => {
    it("updates currentPage and clears detailView", () => {
      useNavigationStore.getState().setPage("songs");
      const state = useNavigationStore.getState();
      expect(state.currentPage).toBe("songs");
      expect(state.detailView).toBeNull();
    });
  });

  describe("setSearchOpen", () => {
    it("sets search open state", () => {
      useNavigationStore.getState().setSearchOpen(true);
      expect(useNavigationStore.getState().isSearchOpen).toBe(true);
    });
  });

  describe("toggleSearch", () => {
    it("toggles isSearchOpen", () => {
      expect(useNavigationStore.getState().isSearchOpen).toBe(false);
      useNavigationStore.getState().toggleSearch();
      expect(useNavigationStore.getState().isSearchOpen).toBe(true);
      useNavigationStore.getState().toggleSearch();
      expect(useNavigationStore.getState().isSearchOpen).toBe(false);
    });
  });

  describe("openAlbumDetail", () => {
    it("sets page to albums with album detail view", () => {
      useNavigationStore.getState().openAlbumDetail(42);
      const state = useNavigationStore.getState();
      expect(state.currentPage).toBe("albums");
      expect(state.detailView).toEqual({ type: "album", id: 42 });
    });
  });

  describe("openPlaylistDetail", () => {
    it("sets page to playlists with playlist detail view", () => {
      useNavigationStore.getState().openPlaylistDetail(7);
      const state = useNavigationStore.getState();
      expect(state.currentPage).toBe("playlists");
      expect(state.detailView).toEqual({ type: "playlist", id: 7 });
    });
  });

  describe("openArtistDetail", () => {
    it("sets page to artists with artist detail view", () => {
      useNavigationStore.getState().openArtistDetail(3);
      const state = useNavigationStore.getState();
      expect(state.currentPage).toBe("artists");
      expect(state.detailView).toEqual({ type: "artist", id: 3 });
    });
  });

  describe("goBack", () => {
    it("clears detailView", () => {
      useNavigationStore.getState().openAlbumDetail(1);
      expect(useNavigationStore.getState().detailView).not.toBeNull();
      useNavigationStore.getState().goBack();
      expect(useNavigationStore.getState().detailView).toBeNull();
    });
  });
});
