

export interface ContentUpload {
  id?: number; // Optional ID for existing uploads
  artistName: string;
  albumName: string;
  songName: string;
  genre: string;
  uploadDate: string; 
  cpName: string;
  country: string;
  mno: string;
  audioFile: File | null;
  audioFileUrl?: string; // URL of the uploaded audio file
  mnoId: number; // Optional MNO ID for the upload
  artistId: number; // Optional Artist ID for the upload
  contractCode?: string;
}
