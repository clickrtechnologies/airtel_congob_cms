export interface AdminReportRow {
  sno: number;
  artistName: string;
  albumName: string;
  songName: string;
  songCode: string;
  qrCode: string;
  genre: string;
  cpName: string;
  licensedCountry: string;
  licensedMno: string;
  contractPdf: string;
  contractExpiry: string; // Use Date if you're handling it as a Date object
  audioFile: string;
  approvalArtist: boolean;
  approvalMno: boolean;
}
