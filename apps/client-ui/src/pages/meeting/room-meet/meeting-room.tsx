import "@livekit/components-styles";

import { MeetingApi } from "@api";
import { RoutesPath } from "@constants";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { livekitHelper } from "@utils";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@layouts/default.layout";
import MeetingSidebar from "./meeting-sidebar";
import RoomHeader from "./room-header";
import { SpinnerScreen } from "@components/spinner";
import React from "react";

function MeetingRoom(props: { friendlyId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { friendlyId } = props;

  const roomConneted = useQuery({
    queryKey: ["meeting-room", friendlyId],
    queryFn: () => {
      return MeetingApi.getRoomToken(friendlyId, "meeting-room").then(
        async ({ token }) => {
          if (!token) throw new Error("Invalid token");
          const room = await livekitHelper.createRoom("meeting-room");
          return livekitHelper.connectRoom(room, token);
        }
      );
    },
  });

  const handleDisconnected = () => {
    navigate(RoutesPath.MEETING);
  };

  const handleEnded = () => {
    navigate(RoutesPath.MEETING);
  };

  React.useEffect(() => {
    return () => {
      if (roomConneted.data) roomConneted.data.disconnect();
      queryClient.removeQueries(roomConneted);
    };
  }, [roomConneted, queryClient]);

  if (roomConneted.isPending) return <SpinnerScreen />;
  if (roomConneted.error) return null;
  return (
    <LiveKitRoom
      audio={true}
      video={true}
      data-lk-theme="default"
      style={{
        minHeight: "100vh",
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
      connectOptions={{ autoSubscribe: true }}
      room={roomConneted.data}
      token={undefined}
      serverUrl={undefined}
      onDisconnected={handleDisconnected}
      onEnded={handleEnded}
    >
      <DefaultLayout
        header={<RoomHeader />}
        sidebar={<MeetingSidebar />}
        main={<VideoConference />}
      />
    </LiveKitRoom>
  );
}

export default MeetingRoom;
