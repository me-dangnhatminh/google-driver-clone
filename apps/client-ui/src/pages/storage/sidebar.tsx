import { Cloud, Loader, PinIcon, Plus, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@components/ui/button";
import DocActions from "./doc-actions";
import { Link, useParams } from "react-router-dom";
import { Progress } from "@components/ui/progress";
import { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import FileUtils from "@/lib/file.utils";
import { useStorage } from "@hooks";
import { RoutesPath, routesUtils } from "@constants";
import { cn } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

type SidebarProps = { folderId?: string; storageId?: string };

const StorageProcessor = (props: { storageId: string }) => {
  const storage = useStorage(props.storageId);
  if (!storage.data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = storage.data;

  if (storage.isLoading) {
    return (
      <div className="flex flex-col space-y-2 px-4">
        <div className="w-full flex justify-center">
          <Loader className="animate-spin text-muted-foreground w-4 h-4" />
        </div>
      </div>
    );
  }

  // if limit null is unlimited
  const limit = data.limit;
  const used = data.used;
  if (!limit || limit < 0) return <div>Unlimited</div>;

  const percent = limit == 0 ? 100 : (used / limit) * 100;
  const limitBytes = FileUtils.formatBytes(limit);
  const usedBytes = FileUtils.formatBytes(used);

  return (
    <div className="flex flex-col space-y-2 px-4">
      <Progress className={cn("h-2", "bg-red-50")} value={percent} />
      <span className="text-sm text-muted-foreground">
        {[usedBytes, limitBytes].join(" of ")}
      </span>
      <Link to="/payment">
        <Button size="sm" className="w-full rounded-full">
          Upgrade Storage
        </Button>
      </Link>
    </div>
  );
};

function Sidebar(props: SidebarProps) {
  const params = useParams();

  const { user } = useAuth0();
  const storageId: string | undefined = useMemo(() => {
    if (!user) return null;
    const metadata = user["custom_metadata"];
    if (!metadata) return undefined;
    return metadata["my-storage"];
  }, [user]);

  const folderId = params.folderId ?? storageId;

  // const fetchBillingPortal = useQuery({
  //   queryKey: ["billing-portal"],
  //   queryFn: () =>
  //     PaymentApi.getCustomerBillingPortal({
  //       return_url: location.href,
  //     }),
  // });

  // const navigateTo = (url: string) => {
  //   toast("Redirecting to billing portal...");
  //   window.location.href = url;
  // };

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
            {folderId && <DocActions folderId={folderId} />}
          </PopoverContent>
        </Popover>

        <div className="flex flex-col space-y-2">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Item icon={link.icon} label={link.label} path={link.path} />
            </Link>
          ))}

          {storageId && (
            <div className="flex flex-col space-y-2 px-4">
              <StorageProcessor storageId={storageId} />
            </div>
          )}
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
