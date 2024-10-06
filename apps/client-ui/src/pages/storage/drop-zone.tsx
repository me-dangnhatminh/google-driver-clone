import { useUploadFiles } from "@hooks";
import { PropsWithChildren, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const uuid = () => Math.random().toString(36).slice(2);

export default function DropZone(
  props: PropsWithChildren<{ folderId?: string }>
) {
  const uploadFiles = useUploadFiles(props.folderId);

  const { getRootProps } = useDropzone({
    noClick: true,
    onDrop: (acceptedFiles, _, e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = acceptedFiles.map((file) => {
        if ("path" in file && typeof file.path === "string")
          return new File([file], file.path.replace(/^\//, ""), file);
        else return new File([file], file.name, file);
      });
      if (files.length === 0) return;

      const controller = new AbortController();
      const toastOpts = {
        id: `upload-${uuid()}`,
        closeButton: true,
        onDismiss: () => controller.abort(),
      };

      uploadFiles.mutate(
        {
          files: files,
          signal: controller.signal,
          onProgress: (progress) => {
            const msg = `Uploading... ${progress}%`;
            toast.message(msg, toastOpts);
          },
        },
        {
          onSettled: () => controller.abort(),
          onSuccess: () => toast.success("Uploaded", toastOpts),
          onError: () => toast.error("Error uploading", toastOpts),
        }
      );
    },
  });
  const dropZoneProps = useMemo(() => getRootProps(), [getRootProps]);

  return (
    <div {...dropZoneProps} style={{ width: "inherit", height: "inherit" }}>
      {props.children}
    </div>
  );
}
