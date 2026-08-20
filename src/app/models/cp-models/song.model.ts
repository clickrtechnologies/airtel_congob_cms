// src/app/models/song.model.ts

export interface Song {
  artistName: string;
  albumName: string;
  songName: string;
  songCode: string;
  qrCodeUrl: string;
  category: string;
  uploadDate: string; // ISO date string (e.g. '2025-06-29')
  cpName: string;
  fromDate: string;
  toDate: string;
  country: string;
  mnoName: string;
  contractAvailable: boolean;
  audioUrl: string;
}
