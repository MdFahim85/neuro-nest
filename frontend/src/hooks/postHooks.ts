import { createPost, getAllPosts, postVoteToggle } from "@/lib/api";
import { VoteType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return mutation;
}

export function useGetPosts() {
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });
  return query;
}

export function usePostVoteToggle() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, voteType }: { id: string; voteType: VoteType }) =>
      postVoteToggle(id, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return mutation;
}
