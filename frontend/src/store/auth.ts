import { GetAPI } from "@/services/RequestService";
import type { AuthUser } from "@/types/types";
import { create } from "zustand";

export const useAuthStore = create<{
  isLoading: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  user: AuthUser | null;
  loadUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}>((set) => ({
  isLoading: true,
  isLoggedIn: false,
  userId: null,
  user: null,
  loadUserProfile: async () => {
    set({ isLoading: true });
    const session = await import("supertokens-web-js/recipe/session");

    const hasSession = await session.doesSessionExist();
    if (!hasSession) {
      return set({ isLoading: false, isLoggedIn: false, userId: null });
    }

    const userId = await session.getUserId();
    const response = await GetAPI("/user/me");

    if (response.success) {
      set({
        isLoading: false,
        isLoggedIn: true,
        userId: userId,
        user: response.data,
      });
    } else {
      return set({
        isLoading: false,
        isLoggedIn: true,
        userId,
        user: null,
      });
    }
  },
  logout: async () => {
    const auth = await import("supertokens-web-js/recipe/emailpassword");
    await auth.signOut();
    set({ isLoggedIn: false, userId: null, user: null });
  },
}));
