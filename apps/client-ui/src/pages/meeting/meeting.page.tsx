import React from "react";
import { RoutesPath } from "@constants";
import { Navigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MeetingNotFound from "./meeting-notfound";
import { MeetingApi } from "@api";
import { AxiosError } from "axios";
import { SpinnerScreen } from "@components/spinner";

const MeetLanding = React.lazy(() => import("./meet.landing"));
const WaitingRoom = React.lazy(() => import("./waiting-room"));
const MeetingRoom = React.lazy(() => import("./room-meet/meeting-room"));

function RoomPage(props: { friendlyId: string }) {
  const queryClient = useQueryClient();
  const friendlyId = props.friendlyId;

  const meeting = useQuery({
    queryKey: ["meeting", friendlyId],
    queryFn: () => MeetingApi.getMeeting(friendlyId),
    throwOnError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) return false;
      }
      return true;
    },
  });

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries(meeting);
    };
  }, [queryClient, meeting]);

  if (meeting.isPending) return <SpinnerScreen />;
  if (meeting.error) {
    const err = meeting.error as AxiosError;
    const status = err?.response?.status;
    if (status === 404) return <MeetingNotFound />;
    throw meeting.error;
  }

  const permission = meeting.data.permissions;
  const access = permission.access;
  if (access.joinMeetingRoom) {
    return <MeetingRoom friendlyId={friendlyId} />;
  }

  if (access.joinWaitingRoom) {
    return <WaitingRoom friendlyId={friendlyId} />;
  }

  throw new Error("Invalid meeting permission");
}

function MeetingPage() {
  const params = useParams<{ friendlyId?: string }>();
  const friendlyId = params.friendlyId;
  if (!friendlyId) return <MeetLanding />;
  const isValid = friendlyId.match(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
  if (!isValid) return <Navigate to={RoutesPath.MEETING} />;
  return <RoomPage friendlyId={friendlyId} />;
}

export default MeetingPage;
