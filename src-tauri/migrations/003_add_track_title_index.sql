-- Add index on tracks(title) to speed up search queries
CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title COLLATE NOCASE);
