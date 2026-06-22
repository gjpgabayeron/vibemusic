import { useMemo, useState } from "react";
import { Disc, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLibraryStore } from "@/stores/library-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { getAlbumTracks } from "@/lib/api";
import { useAudioStore } from "@/stores/audio-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { CardItem } from "@/components/shared/card-item";
import { VirtualizedGrid } from "@/components/shared/virtualized-grid";
import { PageHeader } from "@/components/shared/page-header";
import { SortDropdown } from "@/components/shared/sort-dropdown";
import { PageLayout } from "@/components/shared/page-layout";

export default function AlbumsPage() {
  const albums = useLibraryStore((s) => s.albums);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const albumsSortKey = useSettingsStore((s) => s.albumsSortKey);
  const albumsSortDirection = useSettingsStore((s) => s.albumsSortDirection);
  const setAlbumsSort = useSettingsStore((s) => s.setAlbumsSort);
  const [searchQuery, setSearchQuery] = useState("");

  const openAlbumDetail = useNavigationStore((s) => s.openAlbumDetail);
  const play = useAudioStore((s) => s.play);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const playNext = useAudioStore((s) => s.playNext);

  const handlePlayAlbum = async (albumId: number, shuffle = false) => {
    try {
      const tracks = await getAlbumTracks(albumId);
      if (tracks.length === 0) { toast.error("Album is empty"); return; }
      const queue = shuffle ? [...tracks].sort(() => Math.random() - 0.5) : tracks;
      play(queue[0], queue);
    } catch (e) { logger.error("Failed to play album", e); }
  };

  const handlePlayNext = async (albumId: number) => {
    try {
      const tracks = await getAlbumTracks(albumId);
      if (tracks.length === 0) return;
      [...tracks].reverse().forEach((track) => playNext(track));
      toast.success("Playing album next");
    } catch (e) { logger.error("Failed to play album next", e); toast.error("Failed to play next"); }
  };

  const handleAddToQueue = async (albumId: number) => {
    try {
      const tracks = await getAlbumTracks(albumId);
      if (tracks.length === 0) return;
      tracks.forEach((track) => addToQueue(track));
      toast.success("Added album to queue");
    } catch (e) { logger.error("Failed to add album to queue", e); }
  };

  const filteredAndSortedAlbums = useMemo(() => {
    let result = [...albums];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          (a.artist_name && a.artist_name.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (albumsSortKey) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case "artist":
          valA = (a.artist_name || "").toLowerCase();
          valB = (b.artist_name || "").toLowerCase();
          break;
        case "year":
          valA = a.year || 0;
          valB = b.year || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return albumsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return albumsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [albums, albumsSortKey, albumsSortDirection, searchQuery]);

  return (
    <PageLayout overflowHidden>
      <PageHeader title="Albums">
        <div className="relative w-64 mr-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter albums..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <SortDropdown
          sortKey={albumsSortKey}
          sortDirection={albumsSortDirection}
          onSortChange={(k, d) => setAlbumsSort(k, d)}
          options={[
            { label: "Title", value: "title" },
            { label: "Artist", value: "artist" },
            { label: "Year", value: "year" },
          ]}
        />
      </PageHeader>

      <VirtualizedGrid
        items={filteredAndSortedAlbums}
        renderItem={(album) => (
  <CardItem
    key={album.id}
    title={album.title}
    subtitle={album.artist_name || "Unknown Artist"}
    tertiaryText={`${album.track_count} tracks`}
    artworkSrc={album.artwork_path || undefined}
    artworkType="album"
    variant="portrait"
    onClick={() => openAlbumDetail(album.id)}
    onPlay={() => handlePlayAlbum(album.id)}
    menuActions={{
      onPlay: () => handlePlayAlbum(album.id),
      onShuffle: () => handlePlayAlbum(album.id, true),
      onPlayNext: () => handlePlayNext(album.id),
      onAddToQueue: () => handleAddToQueue(album.id),
    }}
  />
)}
        itemHeight={220}
        emptyState={
          !isLoading ? (
            searchQuery ? (
              <EmptyState
                icon={Search}
                title="No matches found"
                description={`We couldn't find any albums matching "${searchQuery}"`}
              />
            ) : (
              <EmptyState
                icon={Disc}
                title="No albums found"
                description="Import music to see your albums here."
              />
            )
          ) : null
        }
      />
    </PageLayout>
  );
}
