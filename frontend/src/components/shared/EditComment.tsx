import { Comment } from "@/types";
import { Edit, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCommentUpdate } from "@/hooks/postHooks";

export default function EditComment({ comment }: { comment: Comment }) {
  const [editComment, setEditComment] = useState(false);
  const [content, setContent] = useState("");
  const { mutate: handleCommentUpdate, isPending: isUpdatingComment } =
    useCommentUpdate();
  const onCommentUpdate = () => {
    handleCommentUpdate(
      {
        postId: comment.postid,
        commentId: comment.id,
        content,
      },
      {
        onSuccess: () => {
          setEditComment(false);
        },
      }
    );
  };
  return (
    <div className="flex items-center gap-4">
      {editComment ? (
        <div className="flex gap-4">
          <Input
            className="placeholder:text-neutral-500 resize-none bg-neutral-100"
            placeholder="Write a comment."
            value={content ? content : comment.content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            variant={"ghost"}
            onClick={() => onCommentUpdate()}
            disabled={!content || isUpdatingComment}
          >
            {<Save />}
          </Button>
        </div>
      ) : (
        comment.content
      )}
      <Button
        variant={"ghost"}
        onClick={() => setEditComment(true)}
        className={editComment ? "hidden" : "block"}
      >
        <Edit />
      </Button>
    </div>
  );
}
