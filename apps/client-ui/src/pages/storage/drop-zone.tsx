import { PropsWithChildren } from "react";
import ReactDropzone from "react-dropzone";
import { toast } from "sonner";
import { useUploadFiles } from "@hooks";

const uuid = () => Math.random().toString(36).slice(2);

export default function DropZone(
  props: PropsWithChildren<{ folderId?: string }>
) {
  const uploadFiles = useUploadFiles(props.folderId);

  return (
    <ReactDropzone
      useFsAccessApi={false}
      noClick={true}
      multiple={true}
      onDrop={(acceptedFiles) => {
        const files = (
          acceptedFiles as unknown as (File & { path: string })[]
        ).map((file) => {
          return new File([file], file.path.replace(/^\//, ""), file);
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
      }}
    >
      {({ getRootProps }) => (
        <div
          style={{ width: "inherit", height: "inherit" }}
          {...getRootProps()}
        >
          {props.children}
        </div>
      )}
    </ReactDropzone>
  );
}
