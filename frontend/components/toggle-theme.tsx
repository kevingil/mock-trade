import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ToggleTheme = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
      className="w-full h-8 bg-transparent flex items-center justify-center cursor-pointer"
    >
      <div className="flex dark:hidden">
        <Moon className="mr-2 h-4 w-4" />
      </div>

      <div className="dark:flex hidden">
        <Sun className="mr-2 h-4 w-4" />
      </div>
      <span className="">Toggle Theme</span>
    </div>
  );
};
