export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 string
  size: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO String
  end: string; // ISO String
  location?: string;
  description?: string;
  allDay: boolean;
  alarms?: number[]; // Array of minutes before the event to trigger an alarm
  attachments?: Attachment[];
  color?: string; // Hex color code
}

export interface CalendarState {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
}

export enum ViewMode {
  MONTH = 'MONTH',
  LIST = 'LIST'
}

export enum CalendarViewMode {
  DECADE = 'DECADE',
  YEAR = 'YEAR',
  MONTH = 'MONTH'
}

export type Language = 'en' | 'de' | 'tr';

export interface Theme {
  name: string;
  primary: string;   // "R G B" format
  secondary: string; // "R G B" format
}

export type UserRole = 'USER' | 'ADMIN' | 'GUEST';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  avatar?: string;
  createdAt: number;
  lastLogin?: number;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
  source: string;
}

export interface GameState {
  highScore: number;
  isUnlocked: boolean;
}

export interface GlobalConfig {
  maintenanceMode: boolean;
  globalAnnouncement?: string;
  forcedTheme?: Theme | null;
  privacyPolicyContent?: string;
  termsContent?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsersDaily: number;
  totalEventsStored: number; // Just the count, not data
  systemHealth: number; // 0-100
}