use crate::profile::{with_db, with_db_mut};
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle};

#[derive(Debug, Serialize, Deserialize)]
pub struct Playlist {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub artwork_path: Option<String>,
    pub track_count: i64,
    pub created_at: String,
}

// Commands follow below
#[command]
/// Creates a new playlist with the given name and optional description.
pub fn create_playlist(
    app: AppHandle,
    name: String,
    description: Option<String>,
) -> Result<Playlist, String> {
    with_db(&app, |db| db.create_playlist(name, description))
}

#[command]
pub fn delete_playlist(app: AppHandle, id: i64) -> Result<(), String> {
    with_db(&app, |db| db.delete_playlist(id))
}

#[command]
pub fn update_playlist(
    app: AppHandle,
    id: i64,
    name: String,
    description: Option<String>,
    artwork_path: Option<String>,
) -> Result<(), String> {
    with_db(&app, |db| db.update_playlist(id, name, description, artwork_path))
}

#[command]
pub fn get_playlists(app: AppHandle) -> Result<Vec<Playlist>, String> {
    with_db(&app, |db| db.get_playlists())
}

#[command]
pub fn get_playlist_tracks(
    app: AppHandle,
    id: i64,
) -> Result<Vec<crate::library::LibraryTrack>, String> {
    with_db(&app, |db| db.get_playlist_tracks(id))
}

#[command]
pub fn add_track_to_playlist(
    app: AppHandle,
    playlist_id: i64,
    track_id: i64,
) -> Result<(), String> {
    with_db(&app, |db| db.add_track_to_playlist(playlist_id, track_id))
}

#[command]
pub fn remove_track_from_playlist(
    app: AppHandle,
    playlist_id: i64,
    track_id: i64,
) -> Result<(), String> {
    with_db(&app, |db| db.remove_track_from_playlist(playlist_id, track_id))
}

#[command]
pub fn reorder_playlist(
    app: AppHandle,
    id: i64,
    new_order: Vec<i64>,
) -> Result<(), String> {
    with_db_mut(&app, |db| db.reorder_playlist(id, new_order))
}
