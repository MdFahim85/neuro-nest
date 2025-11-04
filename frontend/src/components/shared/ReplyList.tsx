import { Comment } from "@/types";
import { Fragment } from "react/jsx-runtime";
import { useGetReplies } from "@/hooks/postHooks";

export default function ReplyList({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const { isPending, isError, error, data } = useGetReplies(postId, commentId);
  if (isPending) {
    return <div>loading</div>;
  }
  if (isError) {
    return <div>{error.message}</div>;
  }
  return (
    <div>
      <div>
        {data.replies.map((comment: Comment) => {
          return (
            <Fragment key={comment.id}>
              <div>{comment.content}</div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
