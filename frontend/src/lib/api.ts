import apiUrl from "./axios";

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
    const response = await apiUrl.post("/auth/login", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
export const logoutUser = async () => {
  try {
    const response = await apiUrl.get("/auth/logout", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
