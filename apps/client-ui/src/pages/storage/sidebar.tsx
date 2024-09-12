import { Cloud, Loader, PinIcon, Plus, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@components/ui/button";
import DocActions from "./doc-actions";
import { Link } from "react-router-dom";
import { Progress } from "@components/ui/progress";
import { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import FileUtils from "@/lib/file.utils";
import { useStorage } from "@hooks";
import { RoutesPath, routesUtils } from "@constants";
import { cn } from "@/lib/utils";

type SidebarProps = { folderId?: string };
function Sidebar(props: SidebarProps) {
  const storage = useStorage();
  return (
    <div className="w-full h-full bg-white dark:bg-black px-4">
      <Link to={RoutesPath.STORAGE}>
        <div className="h-14 flex items-center">
          <button className="text-2xl opacity-75">Storage</button>
        </div>
      </Link>

      <div className="flex flex-col space-y-4 py-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-fit rounded-full px-6 flex space-x-2">
              <Plus className="w-5 h-5" />
              <span>New</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 mx-2">
            <DocActions folderId={props.folderId} />
          </PopoverContent>
        </Popover>

        <div className="flex flex-col space-y-2">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Item icon={link.icon} label={link.label} path={link.path} />
            </Link>
          ))}

          {(() => {
            if (!storage.data) return null;
            const total = storage.data.total;
            const used = storage.data.used;
            const percent = (used / total) * 100;
            const totalBytes = FileUtils.formatBytes(total);
            const usedBytes = FileUtils.formatBytes(used);
            return (
              <div className="flex flex-col space-y-2 px-4">
                <Progress className="h-2" value={percent} />
                <span>{[usedBytes, totalBytes].join(" of ")}</span>
              </div>
            );
          })()}

          {(() => {
            if (storage.data) return null;
            return (
              <div className="flex flex-col space-y-2 px-4">
                <div className="w-full flex justify-center">
                  <Loader className="animate-spin text-muted-foreground w-4 h-4" />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

interface ItemProps {
  icon: LucideIcon;
  label: string;
  path?: string;
}

const Item = ({ icon: Icon, label, path }: ItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <div
      className={cn(
        "flex items-center transition hover:bg-secondary rounded-sm px-4 py-2 cursor-pointer",
        isActive && "bg-secondary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="pl-2 text-md opacity-75">{label}</span>
    </div>
  );
};

const sidebarLinks = [
  { label: "My Storage", icon: Cloud, path: routesUtils("STORAGE")() },
  { label: "Pinned", icon: PinIcon, path: routesUtils("PINNED")() },
  { label: "Archived", icon: Trash, path: routesUtils("ARCHIVED")() },
];
