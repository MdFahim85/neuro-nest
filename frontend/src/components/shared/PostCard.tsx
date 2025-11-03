import { Post } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown, MessageSquare, Ellipsis } from "lucide-react";
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
import { useDeletePost, usePostVoteToggle } from "@/hooks/postHooks";
import { DeleteAlert } from "./DeleteAlert";
import { EditPostModal } from "../../app/(user)/posts/features/EditPostModal";
import Link from "next/link";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const postedDate = formatDistanceToNow(new Date(post.createdat as Date));
  const { mutate: handleVoteToggle, isPending: isVoting } = usePostVoteToggle();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const handleDeletePost = () => {
    deletePost(post.id);
  };

  return (
    <Card className="w-full hover:shadow-lg hover:scale-101 transition-all bg-neutral-200 dark:bg-neutral-900">
      <CardHeader className="border-b border-gray-400 dark:border-gray-800 mx-2">
        <div className="flex items-center justify-between gap-2 text-sm text-gray-500">
          {/* Author/community details */}
          <div className="flex items-center gap-2">
            <UserAvatar user={post.User} />{" "}
            <span
              className={`text-lg text-gray-500 dark:text-gray-200 ${
                post.subcommunityid ? " sm:block hidden" : "block"
              }`}
            >
              {post.User.displayname}
            </span>
            {post.subcommunityid && (
              <>
                /
                <Link
                  href={`/communities/${post.subcommunityid}`}
                  className="text-xs bg-emerald-500 text-gray-200  px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                >
                  {post.SubCommunity.name}
                </Link>
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
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EditPostModal post={post} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting}
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <DeleteAlert onClick={handleDeletePost} dbData={"post"} />
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
          {/* Upvote */}
          <Button
            variant={"secondary"}
            className={`flex items-center gap-1 hover:text-emerald-500 transition-colors`}
            onClick={() => {
              handleVoteToggle({ postId: post.id, voteType: "UPVOTE" });
            }}
            disabled={isVoting}
          >
            <ArrowUp size={20} />
            <span>{post.upvotecount ?? 0}</span>
          </Button>
          {/* Downvote */}
          <Button
            variant={"secondary"}
            className={`flex items-center gap-1 hover:text-red-500 transition-colors`}
            onClick={() => {
              handleVoteToggle({ postId: post.id, voteType: "DOWNVOTE" });
            }}
            disabled={isVoting}
          >
            <ArrowDown size={20} />
            <span>{post.downvotecount ?? 0}</span>
          </Button>

          {/* CommentBox */}
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
}
