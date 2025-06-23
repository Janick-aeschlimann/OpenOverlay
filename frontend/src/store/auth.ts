import type { AuthUser } from "@/types/types";
import { create } from "zustand";

export const useAuthStore = create<{
  user: AuthUser | null;
  setAuth: (uid: string) => void;
  clearAuth: () => void;
}>((set) => ({
  user: null,
  setAuth: (uid) => set({ user: { userId: uid, email: "", username: "" } }),
  clearAuth: () => set({ user: null }),
}));
