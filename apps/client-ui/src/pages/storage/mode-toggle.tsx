import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts";
import { SunIcon, MoonIcon } from "lucide-react";

export function ModeToggle() {
  const theme = useTheme();

  const useDark = () => {
    theme.setTheme("dark");
  };

  const useLight = () => {
    theme.setTheme("light");
  };

  const useSystem = () => {
    theme.setTheme("system");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SunIcon
            size="1.2rem"
            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            size="1.2rem"
            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={useLight}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={useDark}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={useSystem}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
