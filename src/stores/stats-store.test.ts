import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { useStatsStore } from "./stats-store";

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  mockInvoke.mockReset();
  useStatsStore.setState({
    isLoading: false,
    data: null,
    error: null,
    timeRange: "all",
  });
});

describe("stats-store", () => {
  it("has correct initial state", () => {
    const state = useStatsStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
    expect(state.timeRange).toBe("all");
  });

  describe("setTimeRange", () => {
    it("updates timeRange and fetches stats", async () => {
      mockInvoke.mockResolvedValue({
        top_tracks: [],
        top_artists: [],
        top_albums: [],
        activity_history: [],
        top_genres: [],
        heatmap: [],
        trends: {
          listening_time_change: 0,
          play_count_change: 0,
          new_artists_count: 0,
        },
        total_listening_ms: 0,
        streaks: { current_streak: 0, longest_streak: 0, week_days: [] },
        day_night_split: {
          day_plays: 0,
          night_plays: 0,
          day_percentage: 0,
          night_percentage: 0,
        },
        weekly_wrap: {
          total_plays: 0,
          total_listening_ms: 0,
          unique_tracks: 0,
          unique_artists: 0,
          top_track: null,
          top_artist: null,
          most_active_day: null,
          most_active_day_plays: 0,
        },
      });

      useStatsStore.getState().setTimeRange("7d");

      const state = useStatsStore.getState();
      expect(state.timeRange).toBe("7d");
      expect(mockInvoke).toHaveBeenCalledWith("get_stats", {
        timeRange: "7d",
      });
    });
  });

  describe("fetchStats", () => {
    it("sets data on successful fetch", async () => {
      const mockData = {
        top_tracks: [],
        top_artists: [],
        top_albums: [],
        activity_history: [],
        top_genres: [],
        heatmap: [],
        trends: {
          listening_time_change: 5,
          play_count_change: 10,
          new_artists_count: 2,
        },
        total_listening_ms: 100000,
        streaks: { current_streak: 3, longest_streak: 10, week_days: [] },
        day_night_split: {
          day_plays: 70,
          night_plays: 30,
          day_percentage: 70,
          night_percentage: 30,
        },
        weekly_wrap: {
          total_plays: 50,
          total_listening_ms: 100000,
          unique_tracks: 20,
          unique_artists: 10,
          top_track: "Song A",
          top_artist: "Artist A",
          most_active_day: "Monday",
          most_active_day_plays: 15,
        },
      };
      mockInvoke.mockResolvedValue(mockData);

      await useStatsStore.getState().fetchStats("30d");

      expect(mockInvoke).toHaveBeenCalledWith("get_stats", {
        timeRange: "30d",
      });
      const state = useStatsStore.getState();
      expect(state.data).toEqual(mockData);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets error on failed fetch", async () => {
      mockInvoke.mockRejectedValue(new Error("Network error"));

      await useStatsStore.getState().fetchStats("1y");

      const state = useStatsStore.getState();
      expect(state.error).toBe("Failed to load statistics");
      expect(state.data).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it("sets isLoading during fetch", async () => {
      let resolvePromise!: (data: unknown) => void;
      mockInvoke.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

      const fetchPromise = useStatsStore.getState().fetchStats("all");
      expect(useStatsStore.getState().isLoading).toBe(true);

      resolvePromise({
        top_tracks: [],
        top_artists: [],
        top_albums: [],
        activity_history: [],
        top_genres: [],
        heatmap: [],
        trends: { listening_time_change: 0, play_count_change: 0, new_artists_count: 0 },
        total_listening_ms: 0,
        streaks: { current_streak: 0, longest_streak: 0, week_days: [] },
        day_night_split: { day_plays: 0, night_plays: 0, day_percentage: 0, night_percentage: 0 },
        weekly_wrap: { total_plays: 0, total_listening_ms: 0, unique_tracks: 0, unique_artists: 0, top_track: null, top_artist: null, most_active_day: null, most_active_day_plays: 0 },
      });

      await fetchPromise;
      expect(useStatsStore.getState().isLoading).toBe(false);
    });
  });

  describe("recordPlayback", () => {
    it("calls invoke with trackId and durationMs", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await useStatsStore.getState().recordPlayback(1, 200000);

      expect(mockInvoke).toHaveBeenCalledWith("record_playback", {
        trackId: 1,
        durationMs: 200000,
      });
    });

    it("does not throw on error", async () => {
      mockInvoke.mockRejectedValue(new Error("error"));
      await expect(useStatsStore.getState().recordPlayback(1, 100)).resolves.not.toThrow();
    });
  });
});
