import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { setTheme } = useTheme();

  return (
    <>
      <div className="rounded-full hover:bg-accent flex p-1 justify-center items-center cursor-pointer">
        <Sun className="h-5 w-5 dark:hidden" onClick={() => setTheme("dark")} />
        <Moon
          className="h-5 w-5 hidden dark:block"
          onClick={() => setTheme("light")}
        />
      </div>
    </>
  );
};

export default ThemeToggle;
