"use client";
import ProfileCard from "@/components/shared/ProfileCard";
import { useGetMyDetails } from "@/hooks/userHooks";

export default function MyDetailsFetch() {
  const { data, isPending } = useGetMyDetails();
  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      <ProfileCard user={data.userDetails} />
    </div>
  );
}
