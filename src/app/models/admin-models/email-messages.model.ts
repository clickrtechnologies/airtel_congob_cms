export interface EmailMessage {
  id: number;
  from: string;
  subject: string;
  content: string;
  receivedDate: string;
}