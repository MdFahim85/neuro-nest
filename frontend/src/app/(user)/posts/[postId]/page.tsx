import PostFetch from "./features/PostFetch";

export default async function Post({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return <PostFetch postId={postId} />;
}
