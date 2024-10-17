import { Separator } from "@components/ui/separator";
import { FileUp, FolderIcon, FolderUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import z from "zod";
import { useFolder } from "@hooks";
import React from "react";

const DocActions = (props: { folderId: string }) => {
  const { folderId } = props;
  const [isOpen, setOpen] = React.useState(false);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const folder = useFolder(folderId);

  const fileUpload = folder.fileUpload;
  const filesUpload = folder.filesUpload;

  if (folder.isLoading) return <div>Loading...</div>;
  const data = folder.data;
  if (!data) return <div>No data</div>;

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
      fileUpload.mutate(
        {
          data: { file },
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

  const handleFilesUpload = () => {
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

      filesUpload.mutate(
        {
          data: { files: Array.from(files) },
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
      <CreateFolderModal
        folderId={folderId}
        isOpen={isOpen}
        open={open}
        close={close}
      />
      <div className={btnClass} role="button" onClick={open}>
        <FolderIcon className="w-4 h-4" />
        <span>New folder</span>
      </div>
      <Separator />
      <div className={btnClass} role="button" onClick={handleFileUpload}>
        <FileUp className="w-4 h-4" />
        <span>File upload</span>
      </div>

      <div className={btnClass} role="button" onClick={handleFilesUpload}>
        <FolderUp className="w-4 h-4" />
        <span>Folder upload</span>
      </div>
    </div>
  );
};

const CreateFolderSchema = z.object({
  name: z.string({ required_error: "Folder name is required" }),
});
type CreateFolderData = z.infer<typeof CreateFolderSchema>;

const CreateFolderModal = (props: {
  folderId: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) => {
  const { folderId, isOpen } = props;

  const folder = useFolder(folderId);
  const createFolder = folder.folderCreate;

  const form = useForm({
    resolver: zodResolver(CreateFolderSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: CreateFolderData) => {
    if (createFolder.isPending) return;
    const create = createFolder.mutateAsync(values);
    toast.promise(create, {
      loading: "Creating folder...",
      success: "Folder created",
      error: "Failed to create folder",
    });
    props.close();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Folder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={props.close}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="outline" size="sm" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default DocActions;
