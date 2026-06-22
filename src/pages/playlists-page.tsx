import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { Plus, ListMusic, Search } from "lucide-react";
import { useLibraryStore } from "@/stores/library-store";
import { Playlist } from "@/lib/api";
import { PlaylistCreateDialog } from "@/components/dialogs/playlist-create-dialog";
import { GridSkeleton } from "@/components/shared/grid-skeleton";
import PlaylistCard from "@/components/shared/item/playlist-card";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PlaylistEditDialog } from "@/components/dialogs/playlist-edit-dialog";

import { useSettingsStore } from "@/stores/settings-store";
import { SortDropdown } from "@/components/shared/sort-dropdown";
import { Input } from "@/components/ui/input";
import { VirtualizedGrid } from "@/components/shared/virtualized-grid";
import { PageLayout } from "@/components/shared/page-layout";

export default function PlaylistsPage() {
  // Use global store
  const playlists = useLibraryStore((s) => s.playlists);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);

  const playlistsSortKey = useSettingsStore((s) => s.playlistsSortKey);
  const playlistsSortDirection = useSettingsStore((s) => s.playlistsSortDirection);
  const setPlaylistsSort = useSettingsStore((s) => s.setPlaylistsSort);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedPlaylists = useMemo(() => {
    let result = [...playlists];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Sort
    return result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (playlistsSortKey) {
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "track_count":
          valA = a.track_count;
          valB = b.track_count;
          break;
        case "created_at":
          valA = a.created_at; // ISO string comparison works for dates
          valB = b.created_at;
          break;
        default:
          return 0;
      }

      if (valA < valB) return playlistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return playlistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [playlists, playlistsSortKey, playlistsSortDirection, searchQuery]);

  // Create Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(
    null
  );
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);



  const confirmDelete = async () => {
    if (!playlistToDelete) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(playlistToDelete.id);
    } catch (error) {
      logger.error("Failed to delete playlist", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPlaylistToDelete(null);
    }
  };

  const handleDeleteRequest = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setIsDeleteDialogOpen(true);
  };

  return (
    <PageLayout>
      <PageHeader title="Playlists">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            <div className="relative w-64 mr-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter playlists..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <SortDropdown
              sortKey={playlistsSortKey}
              sortDirection={playlistsSortDirection}
              onSortChange={(k, d) => setPlaylistsSort(k, d)}
              options={[
                { label: "Name", value: "name" },
                { label: "Track Count", value: "track_count" },
                { label: "Date Created", value: "created_at" },
              ]}
            />
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus size={16} />
            Create Playlist
          </Button>
        </div>
        <PlaylistCreateDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </PageHeader>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Playlist?"
        description={`This action cannot be undone. This will permanently delete the playlist "${playlistToDelete?.name}".`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        loadingText="Deleting..."
      />

      {isLoading ? (
        <GridSkeleton
          className="pb-8"
          renderItem={(i) => (
            <div key={i} className="flex flex-col rounded-lg p-3 gap-3">
              <div className="aspect-square w-full rounded-md bg-foreground/5" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-foreground/10" />
                <div className="h-3 w-1/2 rounded bg-foreground/5" />
              </div>
            </div>
          )}
        />
      ) : (
        <VirtualizedGrid
          items={filteredAndSortedPlaylists}
          renderItem={(playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={setEditingPlaylist}
              onDelete={handleDeleteRequest}
            />
          )}
          itemHeight={220}
          emptyState={
            searchQuery ? (
              <EmptyState
                icon={Search}
                title="No matches found"
                description={`We couldn't find any playlists matching "${searchQuery}"`}
              />
            ) : (
              <EmptyState
                icon={ListMusic}
                title="No playlists created"
                description="Create your first playlist to organize your music."
              />
            )
          }
        />
      )}

      {editingPlaylist && (
        <PlaylistEditDialog
          playlist={editingPlaylist}
          open={!!editingPlaylist}
          onOpenChange={(open) => !open && setEditingPlaylist(null)}
        />
      )}
    </PageLayout>
  );
}
