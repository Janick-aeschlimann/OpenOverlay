import type { AuthUser } from "@/types/types";
import { create } from "zustand";

export const useAuthStore = create<{
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}>((set) => ({
  user: null,
  setAuth: (user) => set({ user: user }),
  clearAuth: () => set({ user: null }),
}));
