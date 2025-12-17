export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface HistoryItem {
  id: string;
  query: string;
  summary: string;
  timestamp: number;
  messages: Message[];
}

export interface User {
  email: string;
  name: string;
}

export type ViewState = 'auth' | 'chat' | 'history';
