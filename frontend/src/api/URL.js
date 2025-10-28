import config from "../../config.js"

const API_BASE = config.apiBaseUrl + '/api/';

const URL = {
    // LISTES
    GETLISTS: API_BASE + "lists/",
    CREATELIST: API_BASE + "lists/",
    GETLIST: (tokenOrId) => API_BASE + "lists/" + encodeURIComponent(String(tokenOrId)) + "/",

    GETLIST_BY_ID: (id) => API_BASE + "lists/" + encodeURIComponent(String(id)) + "/",
    // TÂCHES
    CREATE_TASK: API_BASE + "tasks/",
    UPDATE_TASK: (id) => API_BASE + "tasks/" + encodeURIComponent(String(id)) + "/",
    DELETE_TASK: (id) => API_BASE + "tasks/" + encodeURIComponent(String(id)) + "/",
    // tâches par liste
    GET_TASKS_BY_LIST_ID: (listId) => API_BASE + "lists/" + encodeURIComponent(String(listId)) + "/tasks/",
    GET_TASKS_BY_LIST_PATH: (tokenOrId) => API_BASE + "lists/" + encodeURIComponent(String(tokenOrId)) + "/tasks/",
    GET_TASKS_BY_LIST_TOKEN: (token) =>
        API_BASE + "tasks/?list_token=" + encodeURIComponent(String(token)),
};

export default URL;
