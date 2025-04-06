import axios from "axios";
import baseUrl from "./baseUrl";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

type ApiOptions = {
  data?: object;
  method?: "get" | "post" | "put" | "delete";
  headers?: object;
  params?: object;
};

export const api = async (url: string, options: ApiOptions = {}) => {
  const { data, method, headers, params } = options;

  const accessToken = "ACCESS_TOKEN";

  try {
    const response = await axiosInstance.request({
     data, 
      headers: {'Authorization': `Bearer ${accessToken}`, ...headers},
      params,
      method,
      responseType: "json",
      url
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.errors || error) as any;
  }
};

export default api;