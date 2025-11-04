import {
  commentOnPost,
  commentVoteToggle,
  createPost,
  deletePost,
  editPost,
  getAllComments,
  getAllPosts,
  getAllReplies,
  postVoteToggle,
} from "@/lib/api";
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

export function useCommentOnPost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: commentOnPost,
    onSuccess: () => {
      ["comments", "posts"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    },
  });

  return mutation;
}

export function useGetComments(postId: string) {
  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: getAllComments,
  });
  return query;
}

export function useGetReplies(postId: string, commentId: string) {
  const query = useQuery({
    queryKey: ["comments", postId, commentId],
    queryFn: getAllReplies,
  });
  return query;
}

export function useCommentVoteToggle() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: commentVoteToggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  return mutation;
}
