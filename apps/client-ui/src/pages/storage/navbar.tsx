import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

import UserMenu from "./user-menu";
import { MenuIcon, Settings } from "lucide-react";
import sidebarUtil from "@utils/side-bar.util";
import { cn } from "@/lib/utils";

function Navbar() {
  return (
    <div
      className={cn(
        "flex items-center space-x-2 px-6 py-2",
        "justify-between lg:justify-end"
      )}
    >
      <div
        role="button"
        onClick={sidebarUtil.toggle}
        className="p-2 hover:bg-secondary rounded-full transition lg:hidden"
        children={<MenuIcon className="w-5 h-5" />}
      />

      <div className="flex items-center space-x-2">
        <ModeToggle />
        <Link to="/settings">
          <div
            className="p-2 hover:bg-secondary rounded-full transition"
            role="button"
          >
            <Settings className="w-5 h-5" />
          </div>
        </Link>
        <UserMenu />
      </div>
    </div>
  );
}

export default Navbar;
