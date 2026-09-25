import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-Memory Music Library Database ---

interface TrackItem {
  id: string;
  db_track_id: string;
  title: string;
  artist: string;
  album_id: string;
  album_title: string;
  track_no: number;
  duration_ms: number;
  genre: string;
  year: number;
  format: string;
  bitrate: number;
  file_size: number;
  favorited: boolean;
  has_cover: boolean;
  cover_url?: string;
  owned: boolean;
  plays: number;
  last_played_at?: string;
  synced_lyrics?: string;
  plain_lyrics?: string;
}

interface AlbumItem {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  is_compilation: boolean;
  release_year: number;
  track_count: number;
  duration_ms: number;
  has_cover: boolean;
  cover_color: string;
}

interface ArtistItem {
  id: string;
  name: string;
  track_count: number;
  album_count: number;
  bio?: string;
}

interface PlaylistItem {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  visibility: "private" | "collaborative";
  is_smart: boolean;
  created_at: string;
  updated_at: string;
  track_ids: string[];
}

const initialArtists: ArtistItem[] = [
  { id: "artist_1", name: "Aura & The Echoes", track_count: 3, album_count: 1, bio: "Atmospheric electronic and synthwave melodies from Northern Europe." },
  { id: "artist_2", name: "Kavinsky Mirage", track_count: 2, album_count: 1, bio: "Cinematic darksynth inspired by late-night coastal highways." },
  { id: "artist_3", name: "Maya Lin", track_count: 3, album_count: 1, bio: "Warm acoustic fingerstyle, intimate vocals and golden hour harmonies." },
  { id: "artist_4", name: "The Blue Quartet", track_count: 2, album_count: 1, bio: "Modern modal jazz blending acoustic warmth with lush brass." },
  { id: "artist_5", name: "Cosmo Drift", track_count: 2, album_count: 1, bio: "Lo-fi beats, gentle Rhodes piano, and nostalgic vinyl crackle." },
];

const initialAlbums: AlbumItem[] = [
  { id: "album_1", title: "Midnight Waves", artist_id: "artist_1", artist_name: "Aura & The Echoes", is_compilation: false, release_year: 2024, track_count: 3, duration_ms: 654000, has_cover: true, cover_color: "#6366f1" },
  { id: "album_2", title: "Neon Horizon", artist_id: "artist_2", artist_name: "Kavinsky Mirage", is_compilation: false, release_year: 2023, track_count: 2, duration_ms: 480000, has_cover: true, cover_color: "#ec4899" },
  { id: "album_3", title: "Acoustic Sunsets", artist_id: "artist_3", artist_name: "Maya Lin", is_compilation: false, release_year: 2024, track_count: 3, duration_ms: 590000, has_cover: true, cover_color: "#f59e0b" },
  { id: "album_4", title: "Urban Jazz Sessions", artist_id: "artist_4", artist_name: "The Blue Quartet", is_compilation: false, release_year: 2023, track_count: 2, duration_ms: 520000, has_cover: true, cover_color: "#06b6d4" },
  { id: "album_5", title: "Celestial Orbit", artist_id: "artist_5", artist_name: "Cosmo Drift", is_compilation: false, release_year: 2024, track_count: 2, duration_ms: 410000, has_cover: true, cover_color: "#8b5cf6" },
];

const initialTracks: TrackItem[] = [
  {
    id: "track_1",
    db_track_id: "track_1",
    title: "Resonance in the Dark",
    artist: "Aura & The Echoes",
    album_id: "album_1",
    album_title: "Midnight Waves",
    track_no: 1,
    duration_ms: 218000,
    genre: "Synthwave",
    year: 2024,
    format: "FLAC",
    bitrate: 1411,
    file_size: 28400000,
    favorited: true,
    has_cover: true,
    owned: true,
    plays: 42,
    last_played_at: new Date(Date.now() - 3600000).toISOString(),
    synced_lyrics: "[00:00.00] (Synth intro rising softly)\n[00:15.00] Echoes fading in the evening air\n[00:27.50] Footsteps guided by the neon glare\n[00:41.00] Can you hear the pulses in the deep?\n[00:54.00] Promises we whispered, yours to keep\n[01:08.00] Midnight waves, washing over me\n[01:22.00] Electric heart, drifting wild and free\n[01:36.00] (Instrumental synth solo)\n[01:50.00] Light returns before the dawn is near\n[02:05.00] Echoes fading, crystal clear",
    plain_lyrics: "Echoes fading in the evening air\nFootsteps guided by the neon glare\nCan you hear the pulses in the deep?\nPromises we whispered, yours to keep\nMidnight waves, washing over me\nElectric heart, drifting wild and free\nLight returns before the dawn is near\nEchoes fading, crystal clear",
  },
  {
    id: "track_2",
    db_track_id: "track_2",
    title: "Starlight Frequency",
    artist: "Aura & The Echoes",
    album_id: "album_1",
    album_title: "Midnight Waves",
    track_no: 2,
    duration_ms: 224000,
    genre: "Synthwave",
    year: 2024,
    format: "FLAC",
    bitrate: 1411,
    file_size: 29500000,
    favorited: false,
    has_cover: true,
    owned: true,
    plays: 18,
    last_played_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "track_3",
    db_track_id: "track_3",
    title: "Vapor Highway",
    artist: "Aura & The Echoes",
    album_id: "album_1",
    album_title: "Midnight Waves",
    track_no: 3,
    duration_ms: 212000,
    genre: "Synthwave",
    year: 2024,
    format: "FLAC",
    bitrate: 1411,
    file_size: 27900000,
    favorited: true,
    has_cover: true,
    owned: true,
    plays: 29,
    last_played_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "track_4",
    db_track_id: "track_4",
    title: "Redline Overdrive",
    artist: "Kavinsky Mirage",
    album_id: "album_2",
    album_title: "Neon Horizon",
    track_no: 1,
    duration_ms: 245000,
    genre: "Darksynth",
    year: 2023,
    format: "MP3",
    bitrate: 320,
    file_size: 9800000,
    favorited: true,
    has_cover: true,
    owned: false,
    plays: 35,
    last_played_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "track_5",
    db_track_id: "track_5",
    title: "Midnight Cruiser",
    artist: "Kavinsky Mirage",
    album_id: "album_2",
    album_title: "Neon Horizon",
    track_no: 2,
    duration_ms: 235000,
    genre: "Darksynth",
    year: 2023,
    format: "MP3",
    bitrate: 320,
    file_size: 9400000,
    favorited: false,
    has_cover: true,
    owned: false,
    plays: 12,
  },
  {
    id: "track_6",
    db_track_id: "track_6",
    title: "Golden Hour Bloom",
    artist: "Maya Lin",
    album_id: "album_3",
    album_title: "Acoustic Sunsets",
    track_no: 1,
    duration_ms: 195000,
    genre: "Indie Folk",
    year: 2024,
    format: "ALAC",
    bitrate: 950,
    file_size: 19200000,
    favorited: true,
    has_cover: true,
    owned: true,
    plays: 51,
    last_played_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "track_7",
    db_track_id: "track_7",
    title: "Cedar & Pine",
    artist: "Maya Lin",
    album_id: "album_3",
    album_title: "Acoustic Sunsets",
    track_no: 2,
    duration_ms: 188000,
    genre: "Indie Folk",
    year: 2024,
    format: "ALAC",
    bitrate: 950,
    file_size: 18500000,
    favorited: false,
    has_cover: true,
    owned: true,
    plays: 22,
  },
  {
    id: "track_8",
    db_track_id: "track_8",
    title: "Riverbed Whisper",
    artist: "Maya Lin",
    album_id: "album_3",
    album_title: "Acoustic Sunsets",
    track_no: 3,
    duration_ms: 207000,
    genre: "Indie Folk",
    year: 2024,
    format: "ALAC",
    bitrate: 950,
    file_size: 20400000,
    favorited: false,
    has_cover: true,
    owned: true,
    plays: 14,
  },
  {
    id: "track_9",
    db_track_id: "track_9",
    title: "Velvet Alleyway",
    artist: "The Blue Quartet",
    album_id: "album_4",
    album_title: "Urban Jazz Sessions",
    track_no: 1,
    duration_ms: 270000,
    genre: "Jazz",
    year: 2023,
    format: "FLAC",
    bitrate: 1411,
    file_size: 35000000,
    favorited: false,
    has_cover: true,
    owned: false,
    plays: 9,
  },
  {
    id: "track_10",
    db_track_id: "track_10",
    title: "Rain on 5th Avenue",
    artist: "The Blue Quartet",
    album_id: "album_4",
    album_title: "Urban Jazz Sessions",
    track_no: 2,
    duration_ms: 250000,
    genre: "Jazz",
    year: 2023,
    format: "FLAC",
    bitrate: 1411,
    file_size: 32500000,
    favorited: true,
    has_cover: true,
    owned: false,
    plays: 27,
    last_played_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "track_11",
    db_track_id: "track_11",
    title: "Warm Rain Falling",
    artist: "Cosmo Drift",
    album_id: "album_5",
    album_title: "Celestial Orbit",
    track_no: 1,
    duration_ms: 198000,
    genre: "Lo-Fi Beats",
    year: 2024,
    format: "MP3",
    bitrate: 320,
    file_size: 7900000,
    favorited: true,
    has_cover: true,
    owned: true,
    plays: 64,
    last_played_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "track_12",
    db_track_id: "track_12",
    title: "Drifting in Orbit",
    artist: "Cosmo Drift",
    album_id: "album_5",
    album_title: "Celestial Orbit",
    track_no: 2,
    duration_ms: 212000,
    genre: "Lo-Fi Beats",
    year: 2024,
    format: "MP3",
    bitrate: 320,
    file_size: 8500000,
    favorited: false,
    has_cover: true,
    owned: true,
    plays: 31,
  },
];

const initialPlaylists: PlaylistItem[] = [
  {
    id: "playlist_1",
    owner_id: "user_admin",
    name: "Focus & Late Night Beats",
    description: "Relaxing, atmospheric synth and lo-fi tracks for focused coding sessions.",
    visibility: "private",
    is_smart: false,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date().toISOString(),
    track_ids: ["track_1", "track_3", "track_11", "track_12", "track_6"],
  },
  {
    id: "playlist_2",
    owner_id: "user_admin",
    name: "Evening Drive",
    description: "Cruising with retro synths and jazz chords.",
    visibility: "collaborative",
    is_smart: false,
    created_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date().toISOString(),
    track_ids: ["track_4", "track_5", "track_2", "track_10"],
  },
];

// Audio generator: produces a real, rich multi-tone melodious PCM WAV audio buffer
// that loops cleanly and satisfies range headers for browser audio streaming.
function generateAudioWav(seed: number, durationSec = 16): Buffer {
  const sampleRate = 22050;
  const numChannels = 2;
  const bytesPerSample = 2;
  const totalSamples = sampleRate * durationSec;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Musical scales for harmonious chords
  const baseFreqs = [220, 261.63, 329.63, 392, 440, 523.25]; // A3, C4, E4, G4, A4, C5
  const root = baseFreqs[seed % baseFreqs.length];
  const third = root * 1.25;
  const fifth = root * 1.5;

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Envelope for a gentle musical pulse
    const pulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.5 * t);
    const subPulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.0 * t);

    // Warm chord harmonics
    const s1 = Math.sin(2 * Math.PI * root * t) * 0.35;
    const s2 = Math.sin(2 * Math.PI * third * t) * 0.25;
    const s3 = Math.sin(2 * Math.PI * fifth * t) * 0.2;
    const sub = Math.sin(2 * Math.PI * (root / 2) * t) * 0.2 * subPulse;

    const sample = (s1 + s2 + s3 + sub) * pulse * 0.8;
    const intVal = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));

    // Left channel
    buffer.writeInt16LE(intVal, offset);
    offset += 2;
    // Right channel (slight stereo phase)
    const rightSample = (s1 + s2 * 1.05 + s3 * 0.95 + sub) * pulse * 0.8;
    const rightIntVal = Math.max(-32768, Math.min(32767, Math.floor(rightSample * 32767)));
    buffer.writeInt16LE(rightIntVal, offset);
    offset += 2;
  }

  return buffer;
}

// Pre-generate audio buffers for each seed
const audioCache = new Map<number, Buffer>();
function getAudioBuffer(seed: number): Buffer {
  if (!audioCache.has(seed)) {
    audioCache.set(seed, generateAudioWav(seed, 20));
  }
  return audioCache.get(seed)!;
}

// Generate stylish SVG album / track artwork
function generateSvgArtwork(title: string, artist: string, color: string): string {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeArtist = artist.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <radialGradient id="r" cx="80%" cy="20%" r="70%">
      <stop offset="0%" stop-color="white" stop-opacity="0.25" />
      <stop offset="100%" stop-color="transparent" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)" />
  <rect width="600" height="600" fill="url(#r)" />
  <!-- Vinyl groove rings -->
  <circle cx="300" cy="300" r="240" fill="none" stroke="white" stroke-opacity="0.08" stroke-width="1.5" />
  <circle cx="300" cy="300" r="190" fill="none" stroke="white" stroke-opacity="0.07" stroke-width="1.5" />
  <circle cx="300" cy="300" r="140" fill="none" stroke="white" stroke-opacity="0.06" stroke-width="1.5" />
  <circle cx="300" cy="300" r="90" fill="none" stroke="white" stroke-opacity="0.05" stroke-width="1.5" />
  <circle cx="300" cy="300" r="36" fill="${color}" fill-opacity="0.4" />
  <circle cx="300" cy="300" r="14" fill="#09090b" />

  <text x="48" y="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="34" fill="#ffffff" letter-spacing="-0.02em">${safeTitle}</text>
  <text x="48" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="20" fill="rgba(255,255,255,0.7)">${safeArtist}</text>
</svg>`;
}

// In-Memory state
const db = {
  artists: [...initialArtists],
  albums: [...initialAlbums],
  tracks: [...initialTracks],
  playlists: [...initialPlaylists],
  recentPlayed: [] as string[],
  user: {
    id: "user_admin",
    username: "admin",
    role: "admin" as const,
    must_reset_password: false,
  },
  activity: null as unknown,
};

function setupApiRoutes(app: express.Express) {
  // Health
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Auth: Me
  app.get("/api/auth/me", (_req, res) => {
    // Return currently logged-in user
    res.json(db.user);
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { username } = req.body || {};
    db.user.username = username || "admin";
    res.cookie("lumen_session", "session_token_123", { httpOnly: true, path: "/" });
    res.json(db.user);
  });

  // Auth: Logout
  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("lumen_session");
    res.json({ ok: true });
  });

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { username } = req.body || {};
    db.user.username = username || "admin";
    res.cookie("lumen_session", "session_token_123", { httpOnly: true, path: "/" });
    res.json(db.user);
  });

  // Auth: Check Invite
  app.get("/api/auth/invite", (_req, res) => {
    res.json({ valid: true, expires_at: new Date(Date.now() + 86400000).toISOString() });
  });

  // Auth: Reset Password
  app.post("/api/auth/reset-password", (_req, res) => {
    res.json({ ok: true });
  });

  // Tracks list
  app.get("/api/tracks", (req, res) => {
    const { limit = "50", offset = "0", q, sort } = req.query as Record<string, string>;
    let results = [...db.tracks];

    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.artist.toLowerCase().includes(lower) ||
          t.album_title.toLowerCase().includes(lower),
      );
    }

    if (sort === "recent") {
      results.sort((a, b) => (b.last_played_at || "").localeCompare(a.last_played_at || ""));
    } else if (sort === "plays") {
      results.sort((a, b) => b.plays - a.plays);
    }

    const start = parseInt(offset, 10) || 0;
    const lim = parseInt(limit, 10) || 50;
    const items = results.slice(start, start + lim);

    res.setHeader("X-Total-Count", String(results.length));
    return res.json(items);
  });

  // Single Track detail
  app.get("/api/tracks/:id", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    res.json({
      ...track,
      source: "local",
      artists: [{ id: "artist_main", name: track.artist, role: "primary" }],
      aliases: [],
    });
  });

  // Update track
  app.patch("/api/tracks/:id", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const { title, artists, album_title, genre, year, track_no } = req.body;
    if (title) track.title = title;
    if (artists && artists.length > 0) track.artist = artists[0];
    if (album_title) track.album_title = album_title;
    if (genre) track.genre = genre;
    if (year) track.year = year;
    if (track_no !== undefined) track.track_no = track_no;

    res.json({
      ...track,
      source: "local",
      artists: [{ id: "artist_main", name: track.artist, role: "primary" }],
      aliases: [],
    });
  });

  // Delete track
  app.delete("/api/tracks/:id", (req, res) => {
    const idx = db.tracks.findIndex((t) => t.id === req.params.id);
    if (idx !== -1) db.tracks.splice(idx, 1);
    res.status(204).end();
  });
  app.delete("/api/admin/tracks/:id", (req, res) => {
    const idx = db.tracks.findIndex((t) => t.id === req.params.id);
    if (idx !== -1) db.tracks.splice(idx, 1);
    res.status(204).end();
  });

  // Track stream with HTTP Range support for seamless playback & seeking!
  app.get("/api/tracks/:id/stream", (req, res) => {
    const trackIdx = db.tracks.findIndex((t) => t.id === req.params.id);
    const seed = trackIdx >= 0 ? trackIdx : 0;
    const wavBuffer = getAudioBuffer(seed);
    const totalSize = wavBuffer.length;

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "audio/wav",
      });
      res.end(wavBuffer.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        "Content-Length": totalSize,
        "Accept-Ranges": "bytes",
        "Content-Type": "audio/wav",
      });
      res.end(wavBuffer);
    }
  });

  // Track cover
  app.get("/api/tracks/:id/cover", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    const album = track ? db.albums.find((a) => a.id === track.album_id) : null;
    const color = album?.cover_color || "#6366f1";
    const svg = generateSvgArtwork(track?.title || "Track", track?.artist || "Artist", color);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(svg);
  });

  // Album cover
  app.get("/api/albums/:id/cover", (req, res) => {
    const album = db.albums.find((a) => a.id === req.params.id);
    const color = album?.cover_color || "#6366f1";
    const svg = generateSvgArtwork(album?.title || "Album", album?.artist_name || "Artist", color);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(svg);
  });

  // Remote cover proxy & signing
  app.get("/api/covers/remote", (req, res) => {
    const url = req.query.url as string;
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      return res.redirect(url);
    }
    res.status(404).end();
  });
  app.get("/api/covers/sign", (req, res) => {
    const albumId = req.query.album_id as string;
    res.json({
      url: `/api/albums/${encodeURIComponent(albumId || "album_1")}/cover`,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    });
  });

  // Play, Scrobble & Now Playing
  app.post("/api/tracks/:id/play", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    if (track) {
      track.plays += 1;
      track.last_played_at = new Date().toISOString();
      if (!db.recentPlayed.includes(track.id)) {
        db.recentPlayed.unshift(track.id);
      }
    }
    res.json({ ok: true });
  });

  app.post("/api/tracks/:id/scrobble", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/tracks/:id/now-playing", (_req, res) => {
    res.json({ ok: true });
  });

  // Favorites
  app.post("/api/tracks/:id/favorite", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    if (track) track.favorited = true;
    res.json({ ok: true });
  });

  app.delete("/api/tracks/:id/favorite", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id);
    if (track) track.favorited = false;
    res.json({ ok: true });
  });

  app.get("/api/favorites", (_req, res) => {
    const favorites = db.tracks.filter((t) => t.favorited);
    res.json(favorites);
  });

  app.get("/api/recent", (req, res) => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const sorted = [...db.tracks]
      .filter((t) => t.last_played_at)
      .sort((a, b) => (b.last_played_at || "").localeCompare(a.last_played_at || ""))
      .slice(0, limit);
    res.json(sorted);
  });

  // Albums
  app.get("/api/albums", (req, res) => {
    const { limit = "50", offset = "0", q } = req.query as Record<string, string>;
    let results = [...db.albums];

    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(
        (a) => a.title.toLowerCase().includes(lower) || a.artist_name.toLowerCase().includes(lower),
      );
    }

    const start = parseInt(offset, 10) || 0;
    const lim = parseInt(limit, 10) || 50;
    const items = results.slice(start, start + lim);
    res.setHeader("X-Total-Count", String(results.length));
    res.json(items);
  });

  app.get("/api/albums/:id", (req, res) => {
    const album = db.albums.find((a) => a.id === req.params.id);
    if (!album) return res.status(404).json({ error: "Album not found" });
    res.json(album);
  });

  app.get("/api/albums/:id/tracks", (req, res) => {
    const tracks = db.tracks.filter((t) => t.album_id === req.params.id);
    res.json(tracks);
  });

  app.patch("/api/albums/:id", (req, res) => {
    const album = db.albums.find((a) => a.id === req.params.id);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const { title, album_artist, release_year } = req.body;
    if (title) album.title = title;
    if (album_artist) album.artist_name = album_artist;
    if (release_year) album.release_year = release_year;
    res.json(album);
  });

  // Artists
  app.get("/api/artists", (req, res) => {
    const { limit = "50", offset = "0", q } = req.query as Record<string, string>;
    let results = [...db.artists];

    if (q) {
      const lower = q.toLowerCase();
      results = results.filter((a) => a.name.toLowerCase().includes(lower));
    }

    const start = parseInt(offset, 10) || 0;
    const lim = parseInt(limit, 10) || 50;
    const items = results.slice(start, start + lim);
    res.setHeader("X-Total-Count", String(results.length));
    res.json(items);
  });

  app.get("/api/artists/:id", (req, res) => {
    const artist = db.artists.find((a) => a.id === req.params.id);
    if (!artist) return res.status(404).json({ error: "Artist not found" });
    res.json(artist);
  });

  app.get("/api/artists/:id/tracks", (req, res) => {
    const artist = db.artists.find((a) => a.id === req.params.id);
    if (!artist) return res.json([]);
    const tracks = db.tracks.filter((t) => t.artist === artist.name);
    res.json(tracks);
  });

  // Playlists
  app.get("/api/playlists", (_req, res) => {
    res.json(db.playlists);
  });

  app.post("/api/playlists", (req, res) => {
    const { name, description = "", visibility = "private" } = req.body;
    const newPlaylist: PlaylistItem = {
      id: `playlist_${Date.now()}`,
      owner_id: db.user.id,
      name: name || "Untitled Playlist",
      description,
      visibility,
      is_smart: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      track_ids: [],
    };
    db.playlists.push(newPlaylist);
    res.json(newPlaylist);
  });

  app.get("/api/playlists/:id", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  });

  app.patch("/api/playlists/:id", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const { name, description, visibility } = req.body;
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (visibility !== undefined) playlist.visibility = visibility;
    playlist.updated_at = new Date().toISOString();
    res.json(playlist);
  });

  app.delete("/api/playlists/:id", (req, res) => {
    const idx = db.playlists.findIndex((p) => p.id === req.params.id);
    if (idx !== -1) db.playlists.splice(idx, 1);
    res.status(204).end();
  });

  app.get("/api/playlists/:id/tracks", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const tracks = playlist.track_ids
      .map((tid, position) => {
        const track = db.tracks.find((t) => t.id === tid);
        if (!track) return null;
        return {
          position: position + 1,
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          album_id: track.album_id,
          album_title: track.album_title,
          duration_ms: track.duration_ms,
          has_cover: track.has_cover,
          added_at: playlist.created_at,
          play_count: track.plays,
        };
      })
      .filter(Boolean);

    res.json({ tracks });
  });

  app.post("/api/playlists/:id/tracks", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const { track_ids = [] } = req.body;
    for (const tid of track_ids) {
      if (!playlist.track_ids.includes(tid)) {
        playlist.track_ids.push(tid);
      }
    }
    playlist.updated_at = new Date().toISOString();
    res.json({ ok: true });
  });

  app.delete("/api/playlists/:id/tracks/:pos", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const pos = parseInt(req.params.pos, 10) - 1;
    if (pos >= 0 && pos < playlist.track_ids.length) {
      playlist.track_ids.splice(pos, 1);
      playlist.updated_at = new Date().toISOString();
    }
    res.status(204).end();
  });

  app.put("/api/playlists/:id/order", (req, res) => {
    const playlist = db.playlists.find((p) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const { track_ids } = req.body;
    if (Array.isArray(track_ids)) {
      playlist.track_ids = track_ids;
      playlist.updated_at = new Date().toISOString();
    }
    res.json({ ok: true });
  });

  app.get("/api/playlists/:id/collaborators", (_req, res) => {
    res.json([]);
  });
  app.post("/api/playlists/:id/collaborators", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/playlists/invites", (_req, res) => {
    res.json([]);
  });

  // Search
  app.get("/api/search", (req, res) => {
    const query = ((req.query.q as string) || "").toLowerCase().trim();
    if (!query) {
      return res.json({
        tracks: db.tracks.slice(0, 10),
        albums: db.albums.slice(0, 5).map((a) => ({ ...a, source: "local" })),
        artists: db.artists.slice(0, 5).map((a) => ({ ...a, source: "local" })),
        sources: ["local"],
      });
    }

    const matchedTracks = db.tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album_title.toLowerCase().includes(query) ||
        t.genre.toLowerCase().includes(query),
    );

    const matchedAlbums = db.albums
      .filter((a) => a.title.toLowerCase().includes(query) || a.artist_name.toLowerCase().includes(query))
      .map((a) => ({ ...a, source: "local" as const }));

    const matchedArtists = db.artists
      .filter((a) => a.name.toLowerCase().includes(query))
      .map((a) => ({ ...a, source: "local" as const }));

    res.json({
      tracks: matchedTracks,
      albums: matchedAlbums,
      artists: matchedArtists,
      sources: ["local"],
    });
  });

  // Lyrics
  app.get("/api/lyrics", (req, res) => {
    const { track_name = "", artist_name = "" } = req.query as Record<string, string>;
    const track = db.tracks.find(
      (t) =>
        t.title.toLowerCase() === track_name.toLowerCase() ||
        t.title.toLowerCase().includes(track_name.toLowerCase()),
    );

    if (track && (track.synced_lyrics || track.plain_lyrics)) {
      return res.json({
        id: 101,
        trackName: track.title,
        artistName: track.artist,
        albumName: track.album_title,
        syncedLyrics: track.synced_lyrics || null,
        plainLyrics: track.plain_lyrics || null,
      });
    }

    // Default pleasant synchronized lyrics
    const title = track_name || track?.title || "Now Playing";
    const artist = artist_name || track?.artist || "Lumen Artist";
    res.json({
      id: 102,
      trackName: title,
      artistName: artist,
      syncedLyrics: `[00:00.00] (Music playing)\n[00:08.00] Feeling the rhythm in the atmosphere\n[00:20.00] In this moment, everything is clear\n[00:35.00] Melodies dancing through the night\n[00:50.00] Bathed in warm and gentle light\n[01:10.00] (Instrumental interlude)\n[01:30.00] Soundwaves drifting near and far\n[01:45.00] Floating beneath a million stars`,
      plainLyrics: `Feeling the rhythm in the atmosphere\nIn this moment, everything is clear\nMelodies dancing through the night\nBathed in warm and gentle light\nSoundwaves drifting near and far\nFloating beneath a million stars`,
    });
  });

  // Stats & Replay
  app.get("/api/stats/replay", (_req, res) => {
    const totalMs = db.tracks.reduce((sum, t) => sum + t.duration_ms * (t.plays || 1), 0);
    const totalPlays = db.tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

    const topTracks = [...db.tracks].sort((a, b) => b.plays - a.plays).slice(0, 5);
    const topAlbums = db.albums.map((a) => ({
      ...a,
      plays: db.tracks.filter((t) => t.album_id === a.id).reduce((sum, t) => sum + t.plays, 0),
    })).sort((a, b) => b.plays - a.plays);

    const topArtists = db.artists.map((art) => ({
      id: art.id,
      name: art.name,
      plays: db.tracks.filter((t) => t.artist === art.name).reduce((sum, t) => sum + t.plays, 0),
    })).sort((a, b) => b.plays - a.plays);

    res.json({
      summary: {
        total_plays: totalPlays || 280,
        total_ms: totalMs || 72000000,
        unique_tracks: db.tracks.length,
        unique_artists: db.artists.length,
        headline_artist: topArtists[0],
      },
      top_tracks: topTracks,
      top_artists: topArtists,
      top_albums: topAlbums,
      top_genres: [
        { genre: "Synthwave", plays: 89 },
        { genre: "Indie Folk", plays: 87 },
        { genre: "Lo-Fi Beats", plays: 95 },
        { genre: "Jazz", plays: 36 },
      ],
      activity: [
        { bucket_start: "2024-01-01", plays: 45 },
        { bucket_start: "2024-02-01", plays: 68 },
        { bucket_start: "2024-03-01", plays: 92 },
        { bucket_start: "2024-04-01", plays: 75 },
      ],
      bucket: "month",
      available_years: [2024, 2023],
    });
  });

  // Activity
  app.get("/api/activity/current", (_req, res) => {
    res.json({ activity: db.activity });
  });

  app.put("/api/activity", (req, res) => {
    db.activity = { ...req.body, updated_at: new Date().toISOString() };
    res.json(db.activity);
  });

  app.delete("/api/activity/:deviceId", (_req, res) => {
    db.activity = null;
    res.status(204).end();
  });

  // Integrations & Admin
  app.get("/api/integrations/lastfm", (_req, res) => {
    res.json({ connected: false });
  });
  app.get("/api/admin/users", (_req, res) => {
    res.json([db.user]);
  });
  app.get("/api/admin/invites", (_req, res) => {
    res.json([]);
  });
  app.post("/api/admin/invites", (req, res) => {
    res.json({ id: "invite_1", token: "lumen_invite_token", expires_at: new Date(Date.now() + 86400000).toISOString() });
  });
  app.get("/api/admin/library/roots", (_req, res) => {
    res.json([
      { id: "root_1", path: "/music", label: "Main Music Storage", enabled: true, primary: true, exists: true },
    ]);
  });
  app.get("/api/admin/library/rescan", (_req, res) => {
    res.json({ running: false, total: db.tracks.length, processed: db.tracks.length, inserted: 0 });
  });
  app.post("/api/admin/library/rescan", (_req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/admin/library/artistgrid/pins", (_req, res) => res.json([]));
  app.get("/api/admin/library/filen/pins", (_req, res) => res.json([]));
  app.get("/api/admin/library/api-trackers/pins", (_req, res) => res.json([]));
  app.get("/api/admin/tidal/status", (_req, res) => {
    res.json({ connected: false, management_supported: false, accounts: [] });
  });

  // Track upload
  app.post("/api/library/upload", (req, res) => {
    res.json([
      { file: "uploaded_track.mp3", inserted: true, track_id: "track_1" },
    ]);
  });

  // Public Share
  app.get("/api/public/share/track/:id", (req, res) => {
    const track = db.tracks.find((t) => t.id === req.params.id) || db.tracks[0];
    res.json({
      track_id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album_title,
      album_id: track.album_id,
      start_sec: 0,
      duration_ms: track.duration_ms,
      preview_duration_sec: 30,
      preview_url: `/api/tracks/${track.id}/stream`,
      canonical_url: `/shared/track/${track.id}`,
      open_url: `/`,
    });
  });
}

async function start() {
  process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = "true";
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Mount API handlers
  setupApiRoutes(app);

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "frontend/vite.config.ts"),
      root: path.resolve(__dirname, "frontend"),
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumen Music Server is running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
