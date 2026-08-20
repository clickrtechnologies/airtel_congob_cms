// src/app/models/report-models/song-report.model.ts

export interface ArtistReport {
  date: string; // Format: YYYY-MM-DD
  artist: string;
  album: string;
  song: string;
  genre: string;
  downloads: number;
  modes: {
    copy: number;
    ivr: number;
    app: number;
  };
  cp: string;
}
