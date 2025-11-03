"use client";
import PostBoxModal from "@/app/(user)/posts/features/PostBoxModal";
import UserAvatar from "@/components/shared/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-client";

function PostBox() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full bg-neutral-200 dark:bg-neutral-900  ">
      <CardContent>
        <div className="flex gap-4">
          <div className="sm:block hidden">
            <UserAvatar user={user} />
          </div>
          {/* Modal Post */}
          <PostBoxModal />
        </div>
      </CardContent>
    </Card>
  );
}

export default PostBox;
