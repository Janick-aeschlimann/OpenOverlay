import * as React from "react";
import {
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";

import { WorkspaceSwitcher } from "@/components/shadcn/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/shadcn/ui/sidebar";
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspace";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeWorkspace } = useWorkspaceStore();

  const data = {
    workspaceNav: [
      {
        name: "Overlays",
        url: `/workspace/${activeWorkspace?.slug}/overlays`,
        icon: GalleryVerticalEnd,
      },
      {
        name: "Members",
        url: `/workspace/${activeWorkspace?.slug}/members`,
        icon: Users,
      },
      {
        name: "Settings",
        url: `/workspace/${activeWorkspace?.slug}/settings`,
        icon: Settings,
      },
    ],
    mainNav: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        name: "Workspaces",
        url: "/workspaces",
        icon: LayoutGrid,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4 mb-1">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {activeWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.workspaceNav.map((item) => (
                  <SidebarMenuItem className="select-none cursor-pointer">
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className={activeWorkspace ? "mt-auto" : ""}>
          <Separator className="mb-4" />
          <SidebarGroupContent>
            <SidebarMenu>
              {data.mainNav.map((item) => (
                <SidebarMenuItem className="select-none cursor-pointer">
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
