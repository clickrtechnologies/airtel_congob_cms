export interface ReportData {
  sno: number;
  date: string;
  artistName: string;
  albumName: string;
  songName: string;
  genCat: string;
  downloads: number;
  modes: {
    copy: boolean;
    ivr: boolean;
    app: boolean;
  };
  cpName: string;
}
