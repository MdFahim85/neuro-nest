import { Post } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Ellipsis,
  Trash2,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import UserAvatar from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostVoteToggle } from "@/hooks/postHooks";

export const PostCard = ({ post }: { post: Post }) => {
  const { user } = useAuth();
  const postedDate = formatDistanceToNow(new Date(post.createdat as Date));
  const { mutate: handleVoteToggle, isPending } = usePostVoteToggle();

  return (
    <Card className="w-full hover:shadow-lg hover:scale-101 transition-all bg-neutral-200 dark:bg-neutral-900">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2 text-sm text-gray-500">
          {/* Author/community details */}
          <div className="flex items-center gap-2">
            <UserAvatar user={post.User} />{" "}
            <span
              className={`text-lg text-gray-500 dark:text-gray-200 ${
                post.subcommunityid ? " :block hidden" : "block"
              }`}
            >
              {post.User.displayname}
            </span>
            {post.subcommunityid && (
              <>
                {" "}
                /
                <span className="text-xs bg-emerald-500 text-gray-200  px-2 py-1 rounded">
                  {post.SubCommunity.name}
                </span>
              </>
            )}
            <div className="text-sm text-gray-500 sm:block hidden">
              {postedDate} ago
            </div>
          </div>
          {/* Post edit/delete dropdown */}
          {post.authorid === user?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="hover:text-emerald-500 transition-colors"
                >
                  <Ellipsis size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Edit post", post.id);
                  }}
                  className="cursor-pointer focus:text-emerald-500"
                >
                  <Pencil size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Delete post", post.id);
                  }}
                  className="cursor-pointer focus:text-red-500"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <h3 className="text-xl font-semibold py-4">{post.title}</h3>
        <p className="text-gray-700">{post.content}</p>

        {post.mediaurls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.mediaurls.length &&
              post.mediaurls.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-48 object-cover rounded"
                />
              ))}
          </div>
        )}

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-blue-400 text-sm hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-6 text-gray-600">
          <Button
            variant={"secondary"}
            className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
            onClick={() =>
              handleVoteToggle({ id: post.id, voteType: "UPVOTE" })
            }
            disabled={isPending}
          >
            <ArrowUp size={20} />
            <span>{post.upvotecount ?? 0}</span>
          </Button>

          <Button
            variant={"secondary"}
            className="flex items-center gap-1 hover:text-red-500 transition-colors"
            onClick={() =>
              handleVoteToggle({ id: post.id, voteType: "UPVOTE" })
            }
            disabled={isPending}
          >
            <ArrowDown size={20} />
            <span>{post.downvotecount ?? 0}</span>
          </Button>

          <Button
            variant={"secondary"}
            className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
          >
            <MessageSquare size={20} />
            <span>{post.commentcount ?? 0}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
