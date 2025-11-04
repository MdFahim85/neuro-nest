import { useGetComments } from "@/hooks/postHooks";
import { Comment } from "@/types";
import CommentCard from "./CommentCard";
import { Fragment } from "react/jsx-runtime";

export default function CommentList({ postId }: { postId: string }) {
  const { isPending, isError, error, data } = useGetComments(postId);
  if (isPending) {
    return <div>loading</div>;
  }
  if (isError) {
    return <div>{error.message}</div>;
  }
  return (
    <div>
      <div>
        {data.comments.map((comment: Comment) => {
          return (
            <Fragment key={comment.id}>
              <CommentCard comment={comment} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
