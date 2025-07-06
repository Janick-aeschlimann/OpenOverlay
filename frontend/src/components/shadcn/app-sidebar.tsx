import {
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/shadcn/ui/sidebar";
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspace";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useEffect, useState } from "react";
import { GetAPI } from "@/services/RequestService";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeWorkspace } = useWorkspaceStore();

  const [overlays, setOverlays] = useState<Array<any>>([]);

  useEffect(() => {
    const fetchOverlays = async () => {
      const response = await GetAPI(
        `/workspace/${activeWorkspace?.workspaceId}/overlay`
      );
      if (response.success) {
        setOverlays(response.data);
      }
    };
    if (activeWorkspace) {
      fetchOverlays();
    }
  }, [activeWorkspace]);

  const data = {
    workspaceNav: [
      {
        name: "Overlays",
        url: `/workspace/${activeWorkspace?.slug}/overlays`,
        icon: GalleryVerticalEnd,
        children: overlays.map((overlay) => ({
          name: overlay.name,
          url: `/workspace/${activeWorkspace?.workspaceId}/overlay/${overlay.overlayId}`,
        })),
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
                {data.workspaceNav.map((item) => {
                  if (item.children) {
                    return (
                      <Collapsible
                        key={item.name}
                        asChild
                        defaultOpen={true}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.name}>
                              {item.icon && <item.icon />}
                              <span>{item.name}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.name}>
                                  <SidebarMenuSubButton asChild>
                                    <a href={subItem.url}>
                                      <span>{subItem.name}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  } else {
                    return (
                      <SidebarMenuItem className="select-none cursor-pointer">
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                })}
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
