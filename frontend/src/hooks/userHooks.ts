import { getMyDetails, getUserDetails } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useGetMyDetails() {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: getMyDetails,
  });
  return query;
}

export function useGetUserDetails(userId: string) {
  const query = useQuery({
    queryKey: ["users", userId],
    queryFn: getUserDetails,
  });
  return query;
}
