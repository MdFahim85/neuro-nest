import { Comment } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import UserAvatar from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCommentVoteToggle } from "@/hooks/postHooks";
import { useState } from "react";
import CommentBox from "./CommentBox";
import ReplyList from "./ReplyList";

function CommentCard({ comment }: { comment: Comment }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const commentedDate = formatDistanceToNow(
    new Date(comment.createdat as Date)
  );
  const {
    mutate: handleVoteToggle,
    isPending: isVoting,
    isError,
    error,
  } = useCommentVoteToggle();

  return (
    <Card className="my-4 border-0">
      <CardHeader className="flex gap-4 items-center">
        <UserAvatar user={comment.User} />
        <div className="text-sm">{comment.User.displayname}</div>
        <div className="text-xs text-gray-500">{commentedDate} ago</div>
      </CardHeader>
      <CardContent className="ml-12">{comment.content}</CardContent>
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
            {isError && <div>{error.message}</div>}
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
        </div>
      </CardFooter>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

export default CommentCard;
