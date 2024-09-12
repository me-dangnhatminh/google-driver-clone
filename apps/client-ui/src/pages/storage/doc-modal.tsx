import { useForm } from "react-hook-form";
import { useDocModal } from "@hooks";
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
import { CreateFolderDTO } from "@api";
import { useCreateFolder } from "@hooks";

type DocModalProps = { folderId?: string };
function DocModal(props: DocModalProps) {
  const { isOpen, onClose } = useDocModal();

  const createFolder = useCreateFolder(props.folderId);
  const form = useForm<CreateFolderDTO>({
    resolver: zodResolver(CreateFolderDTO),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: CreateFolderDTO) => {
    if (createFolder.isPending) return;
    const create = createFolder.mutateAsync(values);
    toast.promise(create, {
      loading: "Creating folder...",
      success: "Folder created",
      error: "Failed to create folder",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  onClick={onClose}
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
}

export default DocModal;
