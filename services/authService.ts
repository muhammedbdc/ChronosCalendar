import { User, UserRole, AdminStats, SystemLog } from "../types";
import { StorageService } from "../utils/storage";

// Mock Database
const MOCK_ADMIN: User = {
  id: 'admin-001',
  name: 'System Administrator',
  email: 'admin@chronos.app',
  role: 'ADMIN',
  status: 'ACTIVE',
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
  createdAt: Date.now(),
  lastLogin: Date.now()
};

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin' && password === 'ChronosSecure2024!') {
          resolve(MOCK_ADMIN);
          return;
        }
        
        // Simulate User Login
        const users = StorageService.getDatabaseUsers();
        const user = users.find(u => u.email === email);
        
        if (user) {
          if (user.status === 'BANNED') {
            reject(new Error("Account suspended. Contact support."));
            return;
          }
          resolve(user);
        } else {
          reject(new Error("User not found or invalid credentials."));
        }
      }, 1000);
    });
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role: 'USER',
          status: 'ACTIVE',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        StorageService.addUserToDatabase(newUser);
        resolve(newUser);
      }, 1000);
    });
  },

  loginWithGoogle: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser: User = {
          id: `google-${Date.now()}`,
          name: 'Google User',
          email: 'user@gmail.com',
          role: 'USER',
          status: 'ACTIVE',
          avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        StorageService.addUserToDatabase(googleUser);
        resolve(googleUser);
      }, 1500);
    });
  },

  loginWithApple: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const appleUser: User = {
          id: `apple-${Date.now()}`,
          name: 'Apple User',
          email: 'user@icloud.com',
          role: 'USER',
          status: 'ACTIVE',
          avatar: 'https://ui-avatars.com/api/?name=Apple+User&background=000&color=fff',
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        StorageService.addUserToDatabase(appleUser);
        resolve(appleUser);
      }, 1500);
    });
  },

  deleteAccount: async (userId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = StorageService.getDatabaseUsers().filter(u => u.id !== userId);
        localStorage.setItem('chronos_db_users_sim', JSON.stringify(users));
        resolve();
      }, 1000);
    });
  },

  getAdminStats: (): AdminStats => {
    const users = StorageService.getDatabaseUsers();
    const allEvents = StorageService.getAllEncryptedEventsCount();
    
    return {
      totalUsers: users.length + 1240,
      activeUsersDaily: Math.floor((users.length + 1240) * 0.45),
      totalEventsStored: allEvents + 8500,
      systemHealth: 99.9
    };
  },

  // --- New Admin Functions ---

  getAllUsers: (): User[] => {
    return StorageService.getDatabaseUsers();
  },

  updateUserStatus: (userId: string, status: 'ACTIVE' | 'BANNED') => {
    const users = StorageService.getDatabaseUsers();
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    localStorage.setItem('chronos_db_users_sim', JSON.stringify(updated));
  },

  getSystemLogs: (): SystemLog[] => {
    // Generate fake logs
    const sources = ['AUTH', 'API', 'DB', 'SYSTEM'];
    const levels = ['INFO', 'SUCCESS', 'WARN', 'ERROR'] as const;
    const logs: SystemLog[] = [];
    
    for(let i=0; i<20; i++) {
      logs.push({
        id: `log-${i}`,
        timestamp: Date.now() - (i * 1000 * 60 * Math.random()),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: `Simulated system event log entry #${i+100}`
      });
    }
    return logs.sort((a,b) => b.timestamp - a.timestamp);
  }
};