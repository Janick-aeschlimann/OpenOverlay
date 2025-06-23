import { Button } from "./shadcn/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./shadcn/ui/navigation-menu";
import ThemeToggle from "./ThemeToggle";

import Session from "supertokens-web-js/recipe/session";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface Menu {
  title: string;
  url: string;
}

const Navbar: React.FC = () => {
  const menu: Menu[] = [{ title: "Home", url: "/" }];

  const user = useAuthStore((state) => state.user);

  const renderMenuItem = (item: Menu) => {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          href={item.url}
          className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
        >
          {item.title}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  const navigate = useNavigate();

  const logout = async () => {
    await Session.signOut();
    navigate("/login");
  };

  return (
    <>
      <nav className="flex flex-row justify-between items-center w-full bg- px-10 py-4 fixed bg-background z-50">
        <a href="/" className="flex items-center gap-2 w-sm">
          <span className="text-lg font-semibold tracking-tighter">
            OpenOverlay
          </span>
        </a>
        <div className="flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              {menu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end items-center gap-2 w-sm">
          {!user && (
            <>
              <Button asChild variant="outline" size="sm">
                <a href="/login">Login</a>
              </Button>
              <Button asChild size="sm">
                <a href="/signup">Sign up</a>
              </Button>
            </>
          )}
          {user && (
            <>
              <Button size={"sm"} className="cursor-pointer" onClick={logout}>
                Logout
              </Button>
            </>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
