import { Participant } from "@api";
import { useParticipants } from "@livekit/components-react";
import { Room, VideoPresets } from "livekit-client";

const LIVEKIT_SERVER_URL: string = import.meta.env.VITE_LIVEKIT_SERVER_URL;

export const createRoom = async (type: "meeting-room" | "waiting-room") => {
  let resolution = VideoPresets.h540.resolution;
  if (type === "waiting-room") resolution = VideoPresets.h90.resolution;
  const livekitRoom = new Room({
    videoCaptureDefaults: { resolution },
    adaptiveStream: true,
    dynacast: true,
  });
  return livekitRoom;
};

export const parsePart = (part: ReturnType<typeof useParticipants>[number]) => {
  const metadata = JSON.parse(part.metadata ?? "{}");
  const partParsed = Participant.parse({
    ...metadata,
    id: part.identity,
    displayName: part.name,
  });
  return { ...partParsed, isLocal: part.isLocal };
};

export const parseParts = (parts: ReturnType<typeof useParticipants>) => {
  return parts.map(parsePart);
};

export const connectRoom = async (room: Room, token: string) => {
  await room.connect(LIVEKIT_SERVER_URL, token);
  return room;
};

export const livekitHelper = {
  createRoom,
  connectRoom,
};
export default livekitHelper;
