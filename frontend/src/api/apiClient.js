import axios from "axios";
import config from "../../config"

const apiClient = axios.create({
    baseURL: `${config.apiBaseUrl}/api`,
    // withCredentials: true,
    headers: { Accept: 'application/json'}
});

export default apiClient;
