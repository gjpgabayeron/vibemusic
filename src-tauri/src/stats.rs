use crate::database::DbHelper;
use crate::profile::get_library_db_path;
use chrono::{Local, NaiveDate};
use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
pub struct StatsData {
    pub top_tracks: Vec<TopTrack>,
    pub top_artists: Vec<TopArtist>,
    pub top_albums: Vec<TopAlbum>,
    pub activity_history: Vec<ActivityPoint>,
    pub top_genres: Vec<TopGenre>,
    pub heatmap: Vec<HeatmapPoint>,
    pub trends: TrendsData,
    pub total_listening_ms: i64,
    pub streaks: StreaksData,
    pub day_night_split: DayNightSplit,
    pub weekly_wrap: WeeklyWrapData,
}

#[derive(Serialize)]
pub struct TrendsData {
    pub listening_time_change: f64, // Percentage change
    pub play_count_change: f64,
    pub new_artists_count: i64,
}

#[derive(Serialize)]
pub struct HeatmapPoint {
    pub day: u8,
    pub hour: u8,
    pub intensity: u32,
}

#[derive(Serialize)]
pub struct StreaksData {
    pub current_streak: i64,
    pub longest_streak: i64,
    pub week_days: Vec<WeekDayStatus>,
}

#[derive(Serialize)]
pub struct WeekDayStatus {
    pub day: String,
    pub active: bool,
    pub date: String,
}

#[derive(Serialize)]
pub struct DayNightSplit {
    pub day_plays: i64,
    pub night_plays: i64,
    pub day_percentage: f64,
    pub night_percentage: f64,
}

#[derive(Serialize)]
pub struct WeeklyWrapData {
    pub total_plays: i64,
    pub total_listening_ms: i64,
    pub unique_tracks: i64,
    pub unique_artists: i64,
    pub top_track: Option<String>,
    pub top_artist: Option<String>,
    pub most_active_day: Option<String>,
    pub most_active_day_plays: i64,
}

#[derive(Serialize)]
pub struct TopTrack {
    pub id: i64,
    pub title: String,
    pub artist: String,
    pub cover_image: Option<String>,
    pub play_count: i64,
    pub duration_ms: i64,
}

#[derive(Serialize)]
pub struct TopArtist {
    pub id: i64,
    pub name: String,
    pub cover_image: Option<String>,
    pub play_count: i64,
}

#[derive(Serialize)]
pub struct TopAlbum {
    pub id: i64,
    pub title: String,
    pub artist: String,
    pub cover_image: Option<String>,
    pub play_count: i64,
}

#[derive(Serialize)]
pub struct ActivityPoint {
    pub date: String, // YYYY-MM-DD
    pub duration_ms: i64,
}

#[derive(Serialize)]
pub struct TopGenre {
    pub genre: String,
    pub play_count: i64,
}

#[tauri::command]
pub async fn record_playback(
    app: AppHandle,
    track_id: i64,
    duration_ms: i64,
) -> Result<(), String> {
    let db_path = get_library_db_path(&app)?;
    let db = DbHelper::new(&db_path).map_err(|e| e.to_string())?;
    db.record_playback(track_id, duration_ms)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_stats(app: AppHandle, time_range: Option<String>) -> Result<StatsData, String> {
    let db_path = get_library_db_path(&app)?;
    let db = DbHelper::new(&db_path).map_err(|e| e.to_string())?;
    let conn = db._get_conn();

    // Calculate start timestamp
    let range = time_range.as_deref().unwrap_or("all");
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or(std::time::Duration::ZERO)
        .as_secs() as i64;

    let start_timestamp = match range {
        "7d" => now - (7 * 24 * 60 * 60),
        "30d" => now - (30 * 24 * 60 * 60),
        "6mo" => now - (6 * 30 * 24 * 60 * 60),
        "1y" => now - (365 * 24 * 60 * 60),
        _ => 0,
    };

    // 1. Calculate Top Tracks
    let mut stmt = conn.prepare(
        "SELECT 
            t.id, t.title, ar.name, al.artwork_path, 
            COUNT(ph.id) as play_count,
            t.duration_ms
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         LEFT JOIN artists ar ON t.artist_id = ar.id
         LEFT JOIN albums al ON t.album_id = al.id
         WHERE ph.timestamp >= ?
         GROUP BY t.id
         ORDER BY play_count DESC
         LIMIT 10",
    ).map_err(|e| e.to_string())?;

    let top_tracks_iter = stmt.query_map([start_timestamp], |row| {
        Ok(TopTrack {
            id: row.get::<usize, i64>(0)?,
            title: row.get::<usize, String>(1)?,
            artist: row.get::<usize, Option<String>>(2)?.unwrap_or("Unknown".to_string()),
            cover_image: row.get::<usize, Option<String>>(3)?,
            play_count: row.get::<usize, i64>(4)?,
            duration_ms: row.get::<usize, i64>(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut top_tracks: Vec<TopTrack> = Vec::new();
    for t in top_tracks_iter {
        top_tracks.push(t.map_err(|e| e.to_string())?);
    }

    // 2. Calculate Top Artists
    let mut stmt = conn.prepare(
        "SELECT 
            ar.id, ar.name,
            (SELECT artwork_path FROM albums WHERE artist_id = ar.id ORDER BY year DESC LIMIT 1) as artwork_path,
            COUNT(ph.id) as play_count
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         JOIN artists ar ON t.artist_id = ar.id
         WHERE ph.timestamp >= ?
         GROUP BY ar.id
         ORDER BY play_count DESC
         LIMIT 10",
    ).map_err(|e| e.to_string())?;

    let top_artists_iter = stmt.query_map([start_timestamp], |row| {
        Ok(TopArtist {
            id: row.get::<usize, i64>(0)?,
            name: row.get::<usize, String>(1)?,
            cover_image: row.get::<usize, Option<String>>(2)?,
            play_count: row.get::<usize, i64>(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut top_artists: Vec<TopArtist> = Vec::new();
    for a in top_artists_iter {
        top_artists.push(a.map_err(|e| e.to_string())?);
    }

    // 3. Calculate Top Albums
    let mut stmt = conn.prepare(
        "SELECT 
            al.id, al.title, ar.name, al.artwork_path,
            COUNT(ph.id) as play_count
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         JOIN albums al ON t.album_id = al.id
         LEFT JOIN artists ar ON al.artist_id = ar.id
         WHERE ph.timestamp >= ?
         GROUP BY al.id
         ORDER BY play_count DESC
         LIMIT 10",
    ).map_err(|e| e.to_string())?;

    let top_albums_iter = stmt.query_map([start_timestamp], |row| {
        Ok(TopAlbum {
            id: row.get::<usize, i64>(0)?,
            title: row.get::<usize, String>(1)?,
            artist: row.get::<usize, Option<String>>(2)?.unwrap_or("Unknown".to_string()),
            cover_image: row.get::<usize, Option<String>>(3)?,
            play_count: row.get::<usize, i64>(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut top_albums: Vec<TopAlbum> = Vec::new();
    for a in top_albums_iter {
         top_albums.push(a.map_err(|e| e.to_string())?);
    }

    // 4. Activity History (Last 7 Days)
    let seven_days_ago = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or(std::time::Duration::ZERO)
        .as_secs() as i64 - (7 * 24 * 60 * 60);

    let mut stmt = conn.prepare(
        "SELECT 
            date(timestamp, 'unixepoch', 'localtime') as day,
            SUM(duration_ms) as total_duration
         FROM playback_history
         WHERE timestamp >= ?
         GROUP BY day
         ORDER BY day ASC",
    ).map_err(|e| e.to_string())?;

    let activity_iter = stmt.query_map([seven_days_ago], |row| {
        Ok(ActivityPoint {
            date: row.get::<usize, String>(0)?,
            duration_ms: row.get::<usize, i64>(1)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut activity_history: Vec<ActivityPoint> = Vec::new();
    for a in activity_iter {
        activity_history.push(a.map_err(|e| e.to_string())?);
    }

    // 4. Top Genres
     let mut stmt = conn.prepare(
        "SELECT 
            t.genre,
            COUNT(ph.id) as play_count
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         WHERE t.genre IS NOT NULL AND t.genre != '' AND ph.timestamp >= ?
         GROUP BY t.genre
         ORDER BY play_count DESC
         LIMIT 5",
    ).map_err(|e| e.to_string())?;

    let genre_iter = stmt.query_map([start_timestamp], |row| {
        Ok(TopGenre {
            genre: row.get::<usize, String>(0)?,
            play_count: row.get::<usize, i64>(1)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut top_genres: Vec<TopGenre> = Vec::new();
    for g in genre_iter {
        let g: TopGenre = g.map_err(|e| e.to_string())?;
        top_genres.push(g);
    }

    // 5. Total Listening Time (Filtered or Global)
    let total_listening_ms: i64 = conn.query_row(
        "SELECT COALESCE(SUM(duration_ms), 0) FROM playback_history WHERE timestamp >= ?",
        [start_timestamp],
        |row| row.get::<usize, i64>(0),
    ).unwrap_or(0);

    // 6. Heatmap Data (Hour x Day) during the selected period
    let mut stmt = conn.prepare(
        "SELECT 
            CAST(strftime('%w', timestamp, 'unixepoch', 'localtime') AS INTEGER) as day_of_week,
            CAST(strftime('%H', timestamp, 'unixepoch', 'localtime') AS INTEGER) as hour_of_day,
            COUNT(*) as frequency
         FROM playback_history
         WHERE timestamp >= ?
         GROUP BY day_of_week, hour_of_day
         ORDER BY day_of_week ASC, hour_of_day ASC",
    ).map_err(|e| e.to_string())?;

    let heatmap_iter = stmt.query_map([start_timestamp], |row| {
        Ok(HeatmapPoint {
            day: row.get::<usize, u8>(0)?,
            hour: row.get::<usize, u8>(1)?,
            intensity: row.get::<usize, u32>(2)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut heatmap: Vec<HeatmapPoint> = Vec::new();
    for point in heatmap_iter {
        heatmap.push(point.map_err(|e| e.to_string())?);
    }

    // 7. Trends & Discovery
    // Previous period calculation
    let period_duration = now - start_timestamp;
    let prev_start = start_timestamp - period_duration;
    
    // Only calculate trends if not "all time" (arbitrary cutoff for All Time, e.g. > 10 years)
    let has_trends = period_duration < (365 * 24 * 60 * 60 * 10); 

    let (prev_total_time, prev_play_count): (i64, i64) = if has_trends {
        conn.query_row(
            "SELECT 
                COALESCE(SUM(duration_ms), 0), 
                COUNT(id) 
             FROM playback_history 
             WHERE timestamp >= ? AND timestamp < ?",
            [prev_start, start_timestamp],
            |row| Ok((row.get(0)?, row.get(1)?)),
        ).unwrap_or((0, 0))
    } else {
        (0, 0)
    };

    let current_play_count: i64 = conn.query_row(
        "SELECT COUNT(id) FROM playback_history WHERE timestamp >= ?",
        [start_timestamp],
        |row| row.get(0),
    ).unwrap_or(0);

    // Calculate % change
    let calc_change = |current: i64, prev: i64| -> f64 {
        if prev == 0 {
            if current > 0 { 100.0 } else { 0.0 }
        } else {
            ((current as f64 - prev as f64) / prev as f64) * 100.0
        }
    };

    let listening_time_change = calc_change(total_listening_ms, prev_total_time);
    let play_count_change = calc_change(current_play_count, prev_play_count);

    // Discovery: Artists played in this period but NOT before
    let new_artists_count: i64 = if has_trends {
        conn.query_row(
            "SELECT COUNT(DISTINCT t.artist_id)
             FROM playback_history ph
             JOIN tracks t ON ph.track_id = t.id
             WHERE ph.timestamp >= ?
             AND t.artist_id NOT IN (
                SELECT DISTINCT t2.artist_id
                FROM playback_history ph2
                JOIN tracks t2 ON ph2.track_id = t2.id
                WHERE ph2.timestamp < ?
             )",
            [start_timestamp, start_timestamp],
            |row| row.get(0),
        ).unwrap_or(0)
    } else {
        0
    };

    // 8. Streaks: consecutive days with plays
    let mut streak_stmt = conn.prepare(
        "SELECT DISTINCT date(timestamp, 'unixepoch', 'localtime') as play_date
         FROM playback_history
         ORDER BY play_date ASC",
    ).map_err(|e| e.to_string())?;

    let streak_dates: Vec<String> = streak_stmt
        .query_map([], |row| row.get::<usize, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let (current_streak, longest_streak) = calculate_streaks(&streak_dates);

    // Generate week_days: last 7 days with active/inactive status
    let week_days = generate_week_days(&streak_dates, now);

    // 9. Day/Night Split
    let day_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM playback_history
         WHERE timestamp >= ?
         AND CAST(strftime('%H', timestamp, 'unixepoch', 'localtime') AS INTEGER) BETWEEN 6 AND 17",
        [start_timestamp],
        |row| row.get(0),
    ).unwrap_or(0);

    let night_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM playback_history
         WHERE timestamp >= ?
         AND (CAST(strftime('%H', timestamp, 'unixepoch', 'localtime') AS INTEGER) >= 18
              OR CAST(strftime('%H', timestamp, 'unixepoch', 'localtime') AS INTEGER) < 6)",
        [start_timestamp],
        |row| row.get(0),
    ).unwrap_or(0);

    let total_dn = (day_count + night_count) as f64;
    let (day_percentage, night_percentage) = if total_dn > 0.0 {
        ((day_count as f64 / total_dn) * 100.0, (night_count as f64 / total_dn) * 100.0)
    } else {
        (0.0, 0.0)
    };

    // 10. Overview (uses the selected time range)
    let overview_start = start_timestamp;

    let (ww_total_plays, ww_total_time): (i64, i64) = conn.query_row(
        "SELECT COUNT(*), COALESCE(SUM(duration_ms), 0) FROM playback_history WHERE timestamp >= ?",
        [overview_start],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0, 0));

    let ww_unique_tracks: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT track_id) FROM playback_history WHERE timestamp >= ?",
        [overview_start],
        |row| row.get(0),
    ).unwrap_or(0);

    let ww_unique_artists: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT t.artist_id)
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         WHERE ph.timestamp >= ?",
        [overview_start],
        |row| row.get(0),
    ).unwrap_or(0);

    let ww_top_track: Option<String> = conn.query_row(
        "SELECT t.title
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         WHERE ph.timestamp >= ?
         GROUP BY t.id
         ORDER BY COUNT(ph.id) DESC
         LIMIT 1",
        [overview_start],
        |row| row.get(0),
    ).ok();

    let ww_top_artist: Option<String> = conn.query_row(
        "SELECT ar.name
         FROM playback_history ph
         JOIN tracks t ON ph.track_id = t.id
         JOIN artists ar ON t.artist_id = ar.id
         WHERE ph.timestamp >= ?
         GROUP BY ar.id
         ORDER BY COUNT(ph.id) DESC
         LIMIT 1",
        [overview_start],
        |row| row.get(0),
    ).ok();

    let (ww_most_active_day, ww_most_active_plays): (Option<String>, i64) = conn.query_row(
        "SELECT date(timestamp, 'unixepoch', 'localtime') as day, COUNT(*) as cnt
         FROM playback_history
         WHERE timestamp >= ?
         GROUP BY day
         ORDER BY cnt DESC
         LIMIT 1",
        [overview_start],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((None, 0));

    Ok(StatsData {
        top_tracks,
        top_artists,
        top_albums,
        activity_history,
        top_genres,
        heatmap,
        trends: TrendsData {
            listening_time_change,
            play_count_change,
            new_artists_count,
        },
        total_listening_ms,
        streaks: StreaksData {
            current_streak,
            longest_streak,
            week_days,
        },
        day_night_split: DayNightSplit {
            day_plays: day_count,
            night_plays: night_count,
            day_percentage,
            night_percentage,
        },
        weekly_wrap: WeeklyWrapData {
            total_plays: ww_total_plays,
            total_listening_ms: ww_total_time,
            unique_tracks: ww_unique_tracks,
            unique_artists: ww_unique_artists,
            top_track: ww_top_track,
            top_artist: ww_top_artist,
            most_active_day: ww_most_active_day,
            most_active_day_plays: ww_most_active_plays,
        },
    })
}

fn calculate_streaks(dates: &[String]) -> (i64, i64) {
    if dates.is_empty() {
        return (0, 0);
    }

    let today = Local::now().format("%Y-%m-%d").to_string();
    let mut longest = 1i64;
    let mut current_run = 1i64;

    let parsed: Vec<NaiveDate> = dates
        .iter()
        .filter_map(|d| NaiveDate::parse_from_str(d, "%Y-%m-%d").ok())
        .collect();

    if parsed.is_empty() {
        return (0, 0);
    }

    for pair in parsed.windows(2) {
        let prev = pair[0];
        let curr = pair[1];
        if prev.succ_opt() == Some(curr) {
            current_run += 1;
        } else {
            if current_run > longest {
                longest = current_run;
            }
            current_run = 1;
        }
    }
    if current_run > longest {
        longest = current_run;
    }

    // Calculate current streak (from last play date backward)
    let last = *parsed.last().unwrap();
    let current_streak = if let Ok(today_date) = NaiveDate::parse_from_str(&today, "%Y-%m-%d") {
        let days_since = (today_date - last).num_days();
        if days_since <= 1 {
            let mut streak = 1i64;
            let mut expected = last;
            for date in parsed.iter().rev().skip(1) {
                let diff = (expected - *date).num_days();
                if diff == 1 {
                    streak += 1;
                    expected = *date;
                } else {
                    break;
                }
            }
            streak
        } else {
            0
        }
    } else {
        0
    };

    (current_streak, longest)
}

fn generate_week_days(active_dates: &[String], now: i64) -> Vec<WeekDayStatus> {
    let mut week_days = Vec::new();

    // Generate last 7 days based on current timestamp
    let today_secs = now - (now % 86400); // Align to start of today (UTC approximation)
    let active_set: std::collections::HashSet<&str> =
        active_dates.iter().map(|s| s.as_str()).collect();

    for i in (0..7).rev() {
        let day_secs = today_secs - (i as i64 * 86400);
        // Convert to YYYY-MM-DD using chrono
        if let Some(naive) = NaiveDate::from_ymd_opt(1970, 1, 1) {
            let date = naive + chrono::Duration::days(day_secs / 86400);
            let date_str = date.format("%Y-%m-%d").to_string();
            let weekday = date.format("%a").to_string();
            let active = active_set.contains(date_str.as_str());
            week_days.push(WeekDayStatus {
                day: weekday,
                active,
                date: date_str,
            });
        }
    }

    week_days
}
