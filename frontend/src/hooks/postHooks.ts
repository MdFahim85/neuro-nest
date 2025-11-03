import {
  createPost,
  deletePost,
  editPost,
  getAllPosts,
  postVoteToggle,
} from "@/lib/api";
import { VoteType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
    mutationFn: postVoteToggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return mutation;
}

export function useEditPost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editPost,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return mutation;
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return mutation;
}
