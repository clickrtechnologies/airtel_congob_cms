export interface ArtistSong {
  id?: number;
  artistName: string;
  albumName: string;
  songName: string;
  songCode: string;
  genre: string;
  uploadDate: string;
  cpName: string;
  fromDate: string;
  toDate: string;
  licensedCountry: string;
  licensedMno: string;
  approved: boolean;
  fileAudioUrl?: string;
}
