"use client";
import { PostCard } from "@/components/shared/PostCard";
import { useGetPosts } from "@/hooks/postHooks";
import { Post } from "@/types";

export default function PostList() {
  const { isPending, isError, error, data } = useGetPosts();

  if (isPending) {
    return <div>Loading</div>;
  }
  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      {data.posts.map((post: Post) => {
        return (
          <div key={post.id} className="pb-4">
            <PostCard post={post} />
          </div>
        );
      })}
    </div>
  );
}
