import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
  phoneNumber?: string;
  location?: {
    state?: string;
    district?: string;
    pincode?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: Partial<User>, token: string) => void;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
}

const normalizeUser = (user: Partial<User>): User => {
  const id = user.id ?? user._id ?? "";
  return {
    id,
    _id: user._id ?? id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role ?? "farmer",
    phoneNumber: user.phoneNumber,
    location: user.location,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user: normalizeUser(user), token }),
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set((state) => ({ user: normalizeUser({ ...state.user, ...user }) })),
    }),
    {
      name: "auth-storage",
    }
  )
);

export const authSelectors = {
  user: (state: AuthState) => state.user,
  token: (state: AuthState) => state.token,
  isAuthenticated: (state: AuthState) => Boolean(state.user && state.token),
};

export const getPersistedAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};
