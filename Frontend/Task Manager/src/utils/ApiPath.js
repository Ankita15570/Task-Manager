export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
    },
    
    USER: {
        GET_ALL_USERS: "/api/user",
        GET_USER_BY_ID: (userId) => `/api/user/${userId}`,
        CREATE_USER: "/api/user",
        UPDATE_USER: (userId) => `/api/user/${userId}`,
        DELETE_USER: (userId) => `/api/user/${userId}`,
    },

    TASK: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data",
        GET_USER_DASHBOARD_DATA: (userId) => `/api/tasks/user-dashboard-data`,  
        GET_ALL_TASKS: "/api/tasks",
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`,
        CREATE_TASK: "/api/tasks",
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,
        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`
    },

    REPORTS: {
        EXPORT_TASKS: "/api/report/export/tasks",
        EXPORT_USERS: "/api/report/export/users"
    },

    IMAGES: {
        UPLOAD_IMAGE: "/api/auth/upload-image",

    }
};
