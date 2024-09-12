import { cn } from "@/lib/utils";
import emptySvg from "@assets/images/empty.svg";
import { RoutesPath } from "@constants";
import { ChevronRight, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EmptyBackgroup() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center space-y-4">
      <img src={emptySvg} alt="Empty" className="h-32 w-32" />
      <p className="text-center text-gray-500 dark:text-zinc-200">
        There is nothing here. Please check again.
      </p>
    </div>
  );
}

export function FolderaArchivied(props: { folderId?: string }) {
  const navigate = useNavigate();
  let path = RoutesPath.ARCHIVED;
  if (props.folderId) path += "?highlights=" + props.folderId;
  const toFolder = () => navigate(path);

  return (
    <div
      className={cn(
        "w-full h-full",
        "flex items-center justify-center flex-col space-y-4",
        "text-gray-500 dark:text-neutral-200"
      )}
    >
      <h3 className="text-xl">
        This folder is in the trash, to view it you need to restore it first
      </h3>

      <button
        className="flex items-center justify-center mt-4 px-4 py-2 bg-primary dark:bg-primary-dark text-white dark:text-neutral-500 rounded-md"
        onClick={toFolder}
      >
        Find in trash <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
}

export function Loading() {
  return (
    <section className="w-full h-full flex justify-center items-center">
      <Loader className="animate-spin text-muted-foreground w-4 h-4 m-auto" />
    </section>
  );
}
