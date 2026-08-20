export interface ArtistApproval {
  id: number;
  artist: string;
  album: string;
  songName: string;
  songFile: string;
  genre: string;
  uploadDate: string;
  cp: string;
  fromDate: string;
  toDate: string;
  country: string;
  mno: string;
  approved: boolean;
  songCode: string;
  qrUrl: string;
  audioFileUrl?: string;
  artistId: number; // Optional Artist ID for the approval
  mnoId: number; // Optional MNO ID for the approval
  approvedByUser?: boolean; // Optional field to indicate if approved by user
}
