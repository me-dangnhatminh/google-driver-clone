import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import React from "react";
import { Clipboard, Loader } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { RoutesPath } from "@constants";
import { MeetingApi } from "@api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@components/spinner";

const friendlyIdFormat = (friendlyId: string) => {
  let lower = friendlyId.toLowerCase().replace(/[^a-z-]/g, "");
  if (lower.length >= 3 && lower[3] !== "-")
    lower = lower.slice(0, 3) + "-" + lower.slice(3);
  if (lower.length >= 8 && lower[8] !== "-")
    lower = lower.slice(0, 8) + "-" + lower.slice(8);
  if (lower.length > 12) lower = lower.slice(0, 12);
  return lower;
};

const getRoomURL = (friendlyId: string) => {
  const host = window.location.host;
  const path = RoutesPath.MEETING_ROOM.replace(":friendlyId", friendlyId);
  return `${host}${path}`;
};

const PlaceholderMeeting = React.forwardRef(() => {
  const queryClient = useQueryClient();

  const fetch = useQuery({
    queryKey: ["create-placeholder-meeting"],
    queryFn: MeetingApi.createMeeting,
    throwOnError: true,
  });

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries(fetch);
    };
  }, [queryClient, fetch]);

  const handleClipboard = (friendlyId: string) => {
    navigator.clipboard.writeText(friendlyId);
    toast.success(clibMsg, { duration: 700 });
  };

  const title = `Placeholder meeting`;
  const clibMsg = `Copied to clipboard`;

  return (
    <DialogContent className="max-w-sm p-4">
      <DialogTitle>{title}</DialogTitle>
      {fetch.isPending && <Spinner />}
      {fetch.data && (
        <div className="flex space-x-2 items-center">
          <span className="text-sm">
            Your Code: <strong>{getRoomURL(fetch.data.id)}</strong>
          </span>
          <Clipboard
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleClipboard(getRoomURL(fetch.data.id))}
          />
        </div>
      )}
    </DialogContent>
  );
});

const JoinNowDialogContent = React.forwardRef(() => {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetch = useQuery({
    queryKey: ["create-placeholder-meeting"],
    queryFn: MeetingApi.createMeeting,
  });

  React.useEffect(() => {
    if (fetch.data) {
      const id = fetch.data.id;
      const url = RoutesPath.MEETING_ROOM.replace(":friendlyId", id);
      navigate(url);
    }
    if (fetch.isError) closeRef.current?.click();
    return () => {
      queryClient.removeQueries(fetch);
    };
  }, [queryClient, fetch, navigate]);

  return (
    <DialogContent className="w-full h-full flex justify-center items-center bg-transparent border-none shadow-none">
      <DialogClose ref={closeRef} asChild></DialogClose>
      <DialogTitle></DialogTitle>
      <Loader className="animate-spin text-muted-foreground w-4 h-4 text-white dark:text-black" />
    </DialogContent>
  );
});

function NewMeetingButton() {
  const btnText = `New meeting`;
  const btnText2 = `Start a new meeting`;
  const btnText3 = `Placeholder meeting`;

  const btn = `w-full text-left p-2 hover:bg-gray-300 dark:hover:bg-gray-900 text-sm`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button children={btnText} />
      </PopoverTrigger>
      <PopoverContent className="px-0 py-0 mx-2 w-40 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <button className={btn} children={btnText2} />
          </DialogTrigger>
          <DialogPortal>
            <JoinNowDialogContent />
          </DialogPortal>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <button className={btn} children={btnText3} />
          </DialogTrigger>
          <DialogPortal>
            <PlaceholderMeeting />
          </DialogPortal>
        </Dialog>
      </PopoverContent>
    </Popover>
  );
}

function MeetLanding() {
  const navigate = useNavigate();
  const title = `Video conferencing for everyone`;
  const description = `Join a meeting or start a video call from any device.`;
  const btnJoin = `Join`;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = friendlyIdFormat(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form["meeting-friendlyId"];
    const friendlyId = input.value;
    if (friendlyId.length < 12) return;
    const isValid = friendlyId.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/);
    if (!isValid) input.value = "";
    else navigate(RoutesPath.MEETING_ROOM.replace(":friendlyId", friendlyId));
  };

  return (
    <>
      <Toaster />
      <div className="w-screen h-screen flex flex-col justify-center items-center space-y-4 p-2">
        <h1 className="text-2xl font-bold" children={title} />
        <p children={description} />
        <form
          id="new-meeting-form"
          noValidate
          className="flex flex-row justify-center items-center space-x-4"
          onSubmit={handleSubmit}
        >
          <NewMeetingButton />
          <Input
            type="text"
            name="meeting-friendlyId"
            placeholder="xxx-yyyy-zzz"
            maxLength={12}
            onChange={handleInput}
            onPaste={(e) => {
              const value = e.clipboardData.getData("text/plain");
              const endWith = value.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/);
              if (endWith) {
                e.currentTarget.value = endWith[0];
                return;
              }
              e.currentTarget.value = friendlyIdFormat(value);
            }}
          />
          <Button type="submit" children={btnJoin} />
        </form>
      </div>
    </>
  );
}

export default MeetLanding;
