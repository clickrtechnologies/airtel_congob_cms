export interface Contract {
  artistName: string;
  albumName: string;
  songName: string;
  genre: string;
  cpName: string;
  licensedCountry: string;
  licensedMNO: string;
  fromDate: string;     // ISO string or formatted date (e.g., '2025-07-01')
  toDate: string;
  expiryDate: string;
  contractFile: File | null;
  contractCode?: string;
}
