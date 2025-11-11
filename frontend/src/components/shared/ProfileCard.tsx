import { User } from "@/types";

export default function ProfileCard({ user }: { user: User }) {
  return <div>{user.displayname}</div>;
}
