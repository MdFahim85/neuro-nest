"use client";
import { PostCard } from "@/components/shared/PostCard";
import { useGetSinglePost } from "@/hooks/postHooks";

export default function PostFetch({ postId }: { postId: string }) {
  const { data, isPending, isError, error } = useGetSinglePost(postId);
  if (isPending) {
    return <div>loading...</div>;
  }
  if (isError) {
    return <div>{error.message}</div>;
  }
  return (
    <div className="mt-4">
      <PostCard post={data.post} />
    </div>
  );
}
