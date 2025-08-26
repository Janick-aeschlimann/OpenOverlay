import { GetAPI } from "@/services/RequestService";
import type { Workspace } from "@/types/types";
import { create } from "zustand";

export const useWorkspaceStore = create<{
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspace: (workspace: Workspace) => void;
  setWorkspaceSlug: (slug: string) => void;
  fetchWorkspaces: () => void;
  getLastWorkspace: () => void;
}>((set, get) => ({
  activeWorkspace: null,
  workspaces: [],
  setWorkspace: (workspace) => {
    setLastWorkspace(workspace.workspaceId);
    set({ activeWorkspace: workspace });
  },
  setWorkspaceSlug: async (slug) => {
    const workspace = await getWorkspaceWithSlug(slug);
    set({ activeWorkspace: workspace });
  },
  fetchWorkspaces: async () => {
    const workspaces = await fetchWorkspaces();
    set({ workspaces: workspaces });
  },
  getLastWorkspace: () => {
    const workspaceId = localStorage.getItem("workspace");
    let workspace = null;
    if (workspaceId) {
      workspace = get().workspaces.find(
        (obj) => obj.workspaceId == parseInt(workspaceId)
      );
    }
    if (!workspace) {
      workspace = get().workspaces[0];
    }

    set({ activeWorkspace: workspace });
  },
}));

const setLastWorkspace = (workspaceId: number) => {
  localStorage.setItem("workspace", workspaceId.toString());
};

const fetchWorkspaces = async () => {
  const workspaces = (await GetAPI("/workspace")).data;
  return workspaces;
};

const getWorkspaceWithSlug = async (slug: string) => {
  const response = await GetAPI(`/workspace/slug/${slug}`);
  if (response.success) {
    return response.data;
  } else {
    return null;
  }
};
