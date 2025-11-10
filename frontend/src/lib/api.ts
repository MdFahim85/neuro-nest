import { VoteType } from "@/types";
import apiUrl from "./axios";

// Auth API
export const registerUser = async (data: {
  username: string;
  displayname: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await apiUrl.post("/auth/register", data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await apiUrl.post("/auth/login", data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiUrl.get("/auth/logout");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Post API
export const createPost = async (data: {
  title: string;
  content: string;
  authorId: string;
  mediaUrls?: string[];
  hashTags?: string[];
  subCommunityId?: string;
}) => {
  try {
    const response = await apiUrl.post("/posts", data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAllPosts = async () => {
  try {
    const response = await apiUrl.get("/posts");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getSavedPosts = async () => {
  try {
    const response = await apiUrl.get("users/me/saved-posts");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const editPost = async (data: {
  postId: string;
  title?: string;
  content?: string;
  mediaUrls?: string[];
  hashTags?: string[];
}) => {
  try {
    const response = await apiUrl.put(`/posts/${data.postId}/`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deletePost = async (postId: string) => {
  try {
    const response = await apiUrl.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const savePost = async (postId: string) => {
  try {
    const response = await apiUrl.post(`/posts/${postId}/save`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postVoteToggle = async (data: {
  postId: string;
  voteType: VoteType;
}) => {
  try {
    const response = await apiUrl.post(`/posts/${data.postId}/vote`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const commentOnPost = async (data: {
  content: string;
  postId: string;
  parentId: string | null;
}) => {
  try {
    const response = await apiUrl.post(`/posts/${data.postId}/comments`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAllComments = async ({
  queryKey,
}: {
  queryKey: [string, string];
}) => {
  const [, postId] = queryKey;
  try {
    const response = await apiUrl.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getAllReplies = async ({
  queryKey,
}: {
  queryKey: [string, string, string];
}) => {
  const [, postId, commentId] = queryKey;
  try {
    const response = await apiUrl.get(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateComment = async (data: {
  postId: string;
  commentId: string;
  content: string;
}) => {
  try {
    const response = await apiUrl.put(
      `/posts/${data.postId}/comments/${data.commentId}`,
      data
    );
    return response.data;
  } catch (error) {
    Promise.reject(error);
  }
};

export const deleteComment = async (data: {
  postId: string;
  commentId: string;
}) => {
  try {
    const response = await apiUrl.delete(
      `/posts/${data.postId}/comments/${data.commentId}`
    );
    return response.data;
  } catch (error) {
    Promise.reject(error);
  }
};

export const commentVoteToggle = async (data: {
  postId: string;
  commentId: string;
  voteType: VoteType;
}) => {
  try {
    const response = await apiUrl.post(
      `/posts/${data.postId}/comments/${data.commentId}/vote`,
      data
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
