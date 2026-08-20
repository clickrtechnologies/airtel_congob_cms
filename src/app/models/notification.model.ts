export interface Notification {
  id: number;
  message: string;
  type: string;
  songContentId: number;
  seen: boolean;
  userType: any; // <-- add this
  createdAt: string;
}
