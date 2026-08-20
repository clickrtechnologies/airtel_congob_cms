export interface ArtistContract {
  date: string;
  artistName: string;
  albumName: string;
  songName: string;
  genre: string;
  cpName: string;
  fromDate: string;
  toDate: string;
  contractFile: File | null; // Initially null, set on upload
}
