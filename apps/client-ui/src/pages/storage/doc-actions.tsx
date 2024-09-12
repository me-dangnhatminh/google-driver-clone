import { Separator } from "@components/ui/separator";
import { FileUp, FolderIcon, FolderUp } from "lucide-react";
import { toast } from "sonner";
import { useDocModal, useUploadFile, useUploadFolder } from "@hooks";

type DocActionsProps = { folderId?: string };
function DocActions(props: DocActionsProps) {
  const uploadFile = useUploadFile(props.folderId);
  const uploadFolder = useUploadFolder(props.folderId);
  const { onOpen } = useDocModal();

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      const file = files?.[0];
      if (!file) return;
      const controller = new AbortController();
      const toastOpts = {
        id: file.name,
        closeButton: true,
        onDismiss: () => controller.abort(),
      };
      uploadFile.mutate(
        {
          file: file,
          signal: controller.signal,
          onProgress: (progress) => {
            const msg = `Uploading ${file.name}... ${progress}%`;
            toast.message(msg, toastOpts);
          },
        },
        {
          onSettled: () => controller.abort(),
          onSuccess: () => toast.success(`Uploaded ${file.name}`, toastOpts),
          onError: () => toast.error(`Error uploading ${file.name}`, toastOpts),
        }
      );
      input.remove();
    };
    input.click();
  };

  const handleFolderUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("mozdirectory", "");
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const foldername = files[0].webkitRelativePath.split("/")[0];
      if (!foldername) return;

      const controller = new AbortController();
      const toastOpts = {
        id: foldername,
        closeButton: true,
        onDismiss: () => controller.abort(),
      };

      uploadFolder.mutate(
        {
          files: Array.from(files),
          signal: controller.signal,
          onProgress: (progress) => {
            const msg = `Uploading ${foldername}... ${progress}%`;
            toast.message(msg, toastOpts);
          },
        },
        {
          onSettled: () => controller.abort(),
          onSuccess: () => toast.success(`Uploaded ${foldername}`, toastOpts),
          onError: () => {
            toast.error(`Error uploading ${foldername}`, toastOpts);
          },
        }
      );

      input.remove();
    };
    input.click();
  };

  const btnClass = `flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm`;
  return (
    <div>
      <div className={btnClass} role="button" onClick={onOpen}>
        <FolderIcon className="w-4 h-4" />
        <span>New folder</span>
      </div>
      <Separator />
      <div className={btnClass} role="button" onClick={handleFileUpload}>
        <FileUp className="w-4 h-4" />
        <span>File upload</span>
      </div>

      <div className={btnClass} role="button" onClick={handleFolderUpload}>
        <FolderUp className="w-4 h-4" />
        <span>Folder upload</span>
      </div>
    </div>
  );
}

export default DocActions;
