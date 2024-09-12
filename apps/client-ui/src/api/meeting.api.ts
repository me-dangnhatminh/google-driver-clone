import Api from "./api";
import { z } from "zod";

// ====================
// DTOs
// ====================
const toISOString = (date: Date) => date.toISOString();
export const UUID = z.string().uuid();
export const FutureDate = z
  .date()
  .refine((date) => date >= new Date(), "time should be in the future")
  .transform(toISOString);

export const Subject = z.enum([
  "unknown",
  "host",
  "participant",
  "trusted",
  "banned",
]);

export const AccessPermission = z.object({
  meetingInfo: z.boolean(),
  joinMeetingRoom: z.boolean(),
  joinWaitingRoom: z.boolean(),
  manageMeeting: z.boolean(),
  manageParticipant: z.boolean(),
});

export const Meeting = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().nullish(),
  accessLevel: z.string(),
  waitUntil: z.string().nullish(),
});

export const Participant = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarURI: z.string().nullish(),
  subject: Subject,
  permissions: AccessPermission.nullish(),
});

export const GetMeetingResponse = z.object({
  id: z.string(),
  detail: Meeting.nullish(),
  subject: Subject,
  permissions: z.object({
    access: AccessPermission,
  }),
});
export type UUID = z.infer<typeof UUID>;
export type FutureDate = z.infer<typeof FutureDate>;
export type Subject = z.infer<typeof Subject>;
export type Meeting = z.infer<typeof Meeting>;
export type GetMeetingResponse = z.infer<typeof GetMeetingResponse>;
export type Participant = z.infer<typeof Participant>;
export type AccessPermission = z.infer<typeof AccessPermission>;
// ============================================================
// APIs
// ============================================================
export class MeetingApi extends Api {
  static URL = {
    MEETING_GET: `/meetings/:friendlyId`,
    MEETING_CREATE: `/meetings`,
    ROOM_TOKEN: `/meetings/:friendlyId/rooms/:roomType`,
  } as const;

  static getMeeting(friendlyId: string) {
    const url = MeetingApi.URL.MEETING_GET.replace(":friendlyId", friendlyId);
    return Api.get(url).then(({ data }) => GetMeetingResponse.parse(data));
  }

  static createMeeting() {
    const url = MeetingApi.URL.MEETING_CREATE;
    return Api.post<{ id: string }>(url).then(({ data }) => data);
  }

  static getRoomToken(
    friendlyId: string,
    roomType: "meeting-room" | "waiting-room"
  ) {
    const url = MeetingApi.URL.ROOM_TOKEN.replace(
      ":friendlyId",
      friendlyId
    ).replace(":roomType", roomType);
    return Api.get<{ token: string }>(url).then(({ data }) => data);
  }
}

export default MeetingApi;
