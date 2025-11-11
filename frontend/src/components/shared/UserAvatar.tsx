import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { User } from "@/types";

function UserAvatar({ user }: { user: User }) {
  return (
    <Link href={`/users/${user.id}`}>
      <Avatar>
        <AvatarImage
          src={
            user.profilepicture
              ? user.profilepicture
              : "https://github.com/evilrabbit.png"
          }
          alt={user.displayname}
        />
      </Avatar>
    </Link>
  );
}

export default UserAvatar;
