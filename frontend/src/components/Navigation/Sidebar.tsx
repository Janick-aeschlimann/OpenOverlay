import { AppSidebar } from "@/components/shadcn/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/shadcn/ui/sidebar";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

export interface ISidebarProps {
  title: string;
  children: ReactNode;
}

const Sidebar: React.FC<ISidebarProps> = (props) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Navbar title={props.title} />
          <div className="h-full">{props.children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Sidebar;
