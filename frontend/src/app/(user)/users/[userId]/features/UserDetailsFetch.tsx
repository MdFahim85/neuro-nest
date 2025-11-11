"use client";
import ProfileCard from "@/components/shared/ProfileCard";
import { useGetUserDetails } from "@/hooks/userHooks";

export default function UserDetailsFetch({ userId }: { userId: string }) {
  const { data: user, isPending } = useGetUserDetails(userId);
  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      <ProfileCard user={user} />
    </div>
  );
}
