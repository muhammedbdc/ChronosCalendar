import { CalendarEvent, User, GlobalConfig } from "../types";
import { EncryptionService } from "../services/encryptionService";

const EVENT_STORAGE_KEY = 'chronos_encrypted_events';
const USER_SESSION_KEY = 'chronos_session';
const DB_USERS_KEY = 'chronos_db_users_sim'; // Simulating Cloud DB
const APP_CONFIG_KEY = 'chronos_app_config';

// Encryption key would normally be managed by KMS. Here we derive it from session or hardcode for demo.
const MASTER_KEY = "chronos-master-secret"; 

export const StorageService = {
  // --- Event Data (Encrypted) ---
  saveEvents: (events: CalendarEvent[], userId: string) => {
    try {
      // Encrypt data before saving to disk (Cloud simulation)
      const encrypted = EncryptionService.encrypt(events, MASTER_KEY + userId);
      localStorage.setItem(`${EVENT_STORAGE_KEY}_${userId}`, encrypted);
    } catch (e) {
      console.error("Save failed", e);
    }
  },

  loadEvents: (userId: string): CalendarEvent[] | null => {
    try {
      const data = localStorage.getItem(`${EVENT_STORAGE_KEY}_${userId}`);
      if (!data) return null;
      return EncryptionService.decrypt(data, MASTER_KEY + userId);
    } catch (e) {
      console.error("Load failed", e);
      return null;
    }
  },

  getAllEncryptedEventsCount: (): number => {
    // Admin only sees the size, not the content
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(EVENT_STORAGE_KEY)) {
        count += 5; // Mocking approx events per user
      }
    }
    return count;
  },

  // --- User Session ---
  saveSession: (user: User) => {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  },

  loadSession: (): User | null => {
    const data = localStorage.getItem(USER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearSession: () => {
    localStorage.removeItem(USER_SESSION_KEY);
  },

  // --- Cloud DB Simulation ---
  getDatabaseUsers: (): User[] => {
    const data = localStorage.getItem(DB_USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addUserToDatabase: (user: User) => {
    const users = StorageService.getDatabaseUsers();
    if (!users.find(u => u.email === user.email)) {
      users.push(user);
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    }
  },

  // --- Global Config (Admin) ---
  saveConfig: (config: GlobalConfig) => {
    localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
  },

  loadConfig: (): GlobalConfig => {
    const data = localStorage.getItem(APP_CONFIG_KEY);
    return data ? JSON.parse(data) : { maintenanceMode: false };
  }
};