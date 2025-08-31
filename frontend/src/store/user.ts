import { create } from "zustand";
import { getCanvasStore } from "./canvas";
import { persist } from "zustand/middleware";

export interface User {
  username: string;
  color: string;
}

interface UserStore {
  user: User | null;
  editUser: boolean;
  setUser: (user: User) => void;
  setEditUser: (editUser: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      editUser: false,
      setUser: (user) => {
        set({ user: user });
        const canvas = getCanvasStore(0);
        canvas.getState().connection?.canvasSync?.syncUserToYjs();
      },
      setEditUser: (editUser) => {
        set({ editUser: editUser });
      },
    }),
    {
      name: `userStore`,
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
