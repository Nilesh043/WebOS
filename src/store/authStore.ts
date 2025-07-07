import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<boolean>;
  signup: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Mock user database
const mockUsers: Array<User & { password: string }> = [
  {
    id: "1",
    username: "admin",
    email: "admin@webos.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "2",
    username: "demo",
    email: "demo@webos.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "User",
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const user = mockUsers.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password,
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const updatedUser = {
            ...userWithoutPassword,
            lastLogin: new Date(),
          };

          set({
            user: updatedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            error: "Invalid username or password",
            isLoading: false,
          });
          return false;
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if username or email already exists
        const existingUser = mockUsers.find(
          (u) => u.username === userData.username || u.email === userData.email,
        );

        if (existingUser) {
          set({
            error: "Username or email already exists",
            isLoading: false,
          });
          return false;
        }

        // Create new user
        const newUser: User & { password: string } = {
          id: Math.random().toString(36).substr(2, 9),
          ...userData,
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        mockUsers.push(newUser);

        const { password, ...userWithoutPassword } = newUser;
        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          set({ user: updatedUser });

          // Update in mock database
          const userIndex = mockUsers.findIndex((u) => u.id === currentUser.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
          }
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "webos-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
