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
export const editPost = async (data: {
  postId: String;
  title?: String;
  content?: String;
  mediaUrls?: String[];
  hashTags?: String[];
}) => {
  try {
    const response = await apiUrl.put(`/posts/${data.postId}/`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
export const deletePost = async (postId: String) => {
  try {
    const response = await apiUrl.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
