import axios from "axios";
const apiUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ROUTE,
});

apiUrl.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  function onRejected(error) {
    if (error.response) {
      error.message = error.response.data.error;
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiUrl;
