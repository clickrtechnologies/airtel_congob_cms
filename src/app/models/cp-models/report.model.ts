export interface Reports {
activations: any;
  id: number;
  country: string;
  mno: string;
  year: string | number;
  month: string;
  date: string;
  artist: string;
  album: string;
  song: string;
  genre: string;
  downloads: number;
  copy: number;
  ivr: number;
  app: number;
  sms: number;
  ussd: number;
  wap: number;
  rbtSet: number;
  cp: string;
  language?: string;
  modes: {
    copy: number;
    ivr: number;
    app: number;
    sms: number;
    ussd: number;
    wap: number;
  };
}