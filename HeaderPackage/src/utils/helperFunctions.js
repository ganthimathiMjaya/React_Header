import axios from "axios";

export const apiCall = async (url, options = {}) => {
  try {
    const response = await axios({
      url,
      ...options,
    });
    return response.data; 
  } catch (error) {
    console.error("API call failed:", error);
    throw error; 
  }
};

export const fetchData = async (options, url) => {
  try {
    const data = await apiCall(url, options);
    return data; 
  } catch (error) {
    console.error("Fetch data failed:", error);
    throw error;
  }
};
