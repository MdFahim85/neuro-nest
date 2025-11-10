import { Comment } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import UserAvatar from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useCommentDelete, useCommentVoteToggle } from "@/hooks/postHooks";
import { useState } from "react";
import CommentBox from "./CommentBox";
import ReplyList from "./ReplyList";
import { useAuth } from "@/context/auth-client";
import EditComment from "./EditComment";

function CommentCard({ comment }: { comment: Comment }) {
  const { user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const commentedDate = formatDistanceToNow(
    new Date(comment.createdat as Date)
  );
  const { mutate: handleVoteToggle, isPending: isVoting } =
    useCommentVoteToggle();

  const { mutate: handleCommentDelete, isPending: isDeletingComment } =
    useCommentDelete();

  return (
    <Card className="my-4 border-0">
      <CardHeader className="flex gap-4 items-center">
        <UserAvatar user={comment.User} />
        <div className="text-sm">{comment.User.displayname}</div>
        <div className="text-xs text-gray-500">{commentedDate} ago</div>
      </CardHeader>
      <CardContent className="ml-12">
        <EditComment comment={comment} />
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-6 text-gray-400">
          {/* Upvote */}
          <Button
            variant={"ghost"}
            className={`flex items-center gap-1 hover:text-emerald-500 transition-colors`}
            onClick={() => {
              handleVoteToggle({
                commentId: comment.id,
                postId: comment.postid,
                voteType: "UPVOTE",
              });
            }}
            disabled={isVoting}
          >
            <ArrowUp size={20} />
            <span>{comment.upvotecount ?? 0}</span>
          </Button>
          {/* Downvote */}
          <Button
            variant={"ghost"}
            className={`flex items-center gap-1 hover:text-red-500 transition-colors`}
            onClick={() => {
              handleVoteToggle({
                commentId: comment.id,
                postId: comment.postid,
                voteType: "DOWNVOTE",
              });
            }}
            disabled={isVoting}
          >
            <ArrowDown size={20} />
            <span>{comment.downvotecount ?? 0}</span>
          </Button>

          {/* CommentBox */}
          <Button
            variant={"link"}
            className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
            onClick={() => setShowReplyBox((prev) => !prev)}
          >
            reply
          </Button>
          {comment.authorid === user?.id && (
            <Button
              variant={"destructive"}
              onClick={() =>
                handleCommentDelete({
                  postId: comment.postid,
                  commentId: comment.id,
                })
              }
              disabled={isDeletingComment}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </CardFooter>
      <CardFooter>
        {comment._count.other_Comment > 0 && (
          <Button
            variant={"link"}
            onClick={() => setShowReplies((prev) => !prev)}
          >
            view {comment._count.other_Comment}{" "}
            {comment._count.other_Comment > 1 ? "replies" : "reply"}
          </Button>
        )}

        {showReplies && (
          <ReplyList commentId={comment.id} postId={comment.postid} />
        )}
        {showReplyBox && (
          <div className="w-full">
            <CommentBox postId={comment.postid} parentId={comment.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default CommentCard;
