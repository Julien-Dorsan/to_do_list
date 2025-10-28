import axios from "axios";
import config from "../../config"

const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    // withCredentials: true,
});

export default apiClient;
