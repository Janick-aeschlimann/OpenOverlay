import { Button } from "@/components/shadcn/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

import { useAuthStore } from "@/store/auth";
import { SidebarTrigger } from "@/components/shadcn/ui/sidebar";
import { Separator } from "@/components/shadcn/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { LogOut, Settings, UserRound } from "lucide-react";

export interface INavbarProps {
  title: string;
}

const Navbar: React.FC<INavbarProps> = (props) => {
  const { user, logout } = useAuthStore();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between pr-5 pt-5 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-4"
          />
          <h1 className="text-xl font-semibold pl-2 pb-1 hidden sm:block">
            {props.title}
          </h1>
        </div>
        <div className="bg-background flex items-center gap-4 rounded-full border py-1 px-4 shadow-xs">
          <Button className="rounded-full cursor-pointer hidden sm:block">
            Create Overlay
          </Button>
          <Button className="rounded-full cursor-pointer sm:hidden">
            Create
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="cursor-pointer peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md py-0 px-3 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-11 text-sm group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar>
                  <AvatarImage
                    src={`${
                      import.meta.env.VITE_API_URL
                    }/uploads/profile-pictures/${user?.profile_picture}`}
                  />
                  <AvatarFallback className="bg-blue-500">
                    {user?.username[0]}
                  </AvatarFallback>
                </Avatar>
                <h1 className="select-none font-semibold">{user?.username}</h1>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="cursor-pointer">
                <UserRound />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOut color="red" />
                <p className="text-red-500 font-semibold">Logout</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </header>
    </>
  );
};

export default Navbar;
