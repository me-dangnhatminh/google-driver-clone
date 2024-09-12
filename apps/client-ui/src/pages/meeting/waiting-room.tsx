import "@livekit/components-styles";
import { PreJoin } from "@livekit/components-react";
import { Stack } from "@mui/joy";
import { livekitHelper } from "@utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MeetingApi } from "@api";
import React from "react";
import { Room } from "livekit-client";
import WaitingChat from "./waiting-chat";
import { Spinner } from "@components/spinner";

interface WaitingRoomProps {
  friendlyId: string;
}
function WaitingRoom({ friendlyId }: WaitingRoomProps) {
  const queryClient = useQueryClient();
  const connectRoom = useQuery<Room>({
    queryKey: ["waiting-room", friendlyId],
    throwOnError: true,
    queryFn: async () => {
      const res = await MeetingApi.getRoomToken(friendlyId, "waiting-room");
      const room = await livekitHelper.createRoom("waiting-room");
      return livekitHelper.connectRoom(room, res.token);
    },
  });

  React.useEffect(() => {
    return () => {
      if (connectRoom.data) connectRoom.data.disconnect();
      queryClient.removeQueries(connectRoom);
    };
  }, [queryClient, connectRoom]);

  return (
    <Stack
      sx={{
        "#prejoin-container": {
          "& .lk-prejoin": {},
          "& .lk-prejoin input.lk-form-control": {},
          "& .lk-prejoin button": {},
          "& [aria-disabled='true']": {
            "& .lk-join-button": { opacity: 0.5 },
          },
          height: 500,
        },
      }}
      className="w-screen h-screen p-2 flex justify-center items-center"
    >
      <div
        id="prejoin-container"
        className="
          w-full max-w-4xl
          h-full
          grid grid-cols-1 md:grid-cols-2
          md:overflow-hidden
          justify-center items-center
          rounded-lg shadow-md
        "
      >
        <div className="w-full h-full  bg-gray-200">
          <PreJoin
            data-lk-theme="default"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "24rem",
              objectFit: "cover",
            }}
            onChange={(e) => {
              const input = e.target;
              if (!(input instanceof HTMLInputElement)) {
                throw new Error("Invalid input");
              }
            }}
          ></PreJoin>
        </div>
        <div className="w-full h-full bg-white dark:bg-gray-800 min-h-96">
          {!connectRoom.data && <Spinner />}
          {connectRoom.data && <WaitingChat room={connectRoom.data} />}
        </div>
      </div>
    </Stack>
  );
}

export default WaitingRoom;
