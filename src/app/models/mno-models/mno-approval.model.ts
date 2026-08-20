export interface MnoApproval {
  id: number;
  artist: string;
  album: string;
  songName: string;
  songCode: string;
  qrUrl: string;
  genre: string;
  cp: string;
  country: string;
  mno: string;
  contractFileUrl: string;
  expiryDate: string;
  audioFileUrl: string;
  approvedByMno: boolean;
  rejectionReason: string;
  uploadDate?: string;
  fromDate?: string;
  toDate?: string;
  licensedCountry?: string;
  cpId?: number;
  subCategory?: string;
  category?: string;
}
