import { MeetingApi } from "@api";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useMeeting = (friendlyId: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meeting", friendlyId],
    queryFn: () => MeetingApi.getMeeting(friendlyId),
    throwOnError(error, query) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          query.cancel();
          return false;
        }
      }
      return true;
    },
  });

  return { data, isLoading, isError, error: error ? "not_found" : null };
};
