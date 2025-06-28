import { Ban, ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/shadcn/ui/sidebar";
import { useWorkspaceStore } from "@/store/workspace";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const {
    activeWorkspace,
    workspaces,
    setWorkspace,
    setWorkspaceSlug,
    fetchWorkspaces,
    getLastWorkspace,
  } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initWorkspace = async () => {
      await fetchWorkspaces();
      if (location.pathname.startsWith("/workspace/")) {
        setWorkspaceSlug(location.pathname.split("/")[2]);
      } else {
        getLastWorkspace();
      }
    };
    initWorkspace();
  }, []);

  useEffect(() => {
    console.log(activeWorkspace);
    if (activeWorkspace) {
      navigate(`/workspace/${activeWorkspace?.slug}`);
    }
  }, [activeWorkspace]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {activeWorkspace != null && (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeWorkspace.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          )}
          {activeWorkspace == null && (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Ban className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">No Workspace</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.name}
                onClick={() => setWorkspace(workspace)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <GalleryVerticalEnd className="size-3.5 shrink-0" />
                </div>
                {workspace.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/workspace/new")}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add Workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
