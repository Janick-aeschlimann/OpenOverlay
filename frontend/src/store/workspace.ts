import type { Workspace } from "@/types/types";
import { GalleryHorizontal, GalleryVertical, TestTube } from "lucide-react";
import { create } from "zustand";

export const useWorkspaceStore = create<{
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => void;
  getLastWorkspace: () => void;
}>((set, get) => ({
  activeWorkspace: null,
  workspaces: [],
  setWorkspace: (workspace) => {
    setLastWorkspace(workspace.id);
    set({ activeWorkspace: workspace });
  },
  fetchWorkspaces: async () => {
    const workspaces = await getWorkspaces();
    set({ workspaces: workspaces });
  },
  getLastWorkspace: () => {
    const workspaceId = localStorage.getItem("workspace") || 0;
    const workspace = get().workspaces.find((obj) => obj.id == workspaceId);
    console.log(get());
    set({ activeWorkspace: workspace });
  },
}));

const setLastWorkspace = (workspaceId: number) => {
  localStorage.setItem("workspace", workspaceId.toString());
};

const getWorkspaces = (): Workspace[] => {
  return [
    {
      id: 0,
      name: "Test Workspace",
      slug: "test-workspace",
      logo: TestTube,
    },
    {
      id: 1,
      name: "Workspace 2",
      slug: "workspace2",
      logo: GalleryHorizontal,
    },
    {
      id: 2,
      name: "Workspace 3",
      slug: "workspace3",
      logo: GalleryVertical,
    },
  ];
};
