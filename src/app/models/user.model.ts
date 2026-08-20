export interface User {
  email: string;
  password: string;
  role: 'admin' | 'cp' | 'artist' | 'mno';
}
