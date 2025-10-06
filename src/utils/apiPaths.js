export const BASE_URL = "https://backend-interview-prep-ai.vercel.app/";

export const API_PATHS ={
    AUTH: {
        REGISTER: "/api/auth/register", //Signup
        LOGIN: "/api/auth/login", //Authentication user & return JWT token
        GET_PROFILE: "/api/auth/profile" //Get logged-in user details
    },

    IMAGE: {
        UPLOAD_IMAGE:  "/api/auth/upload-image", //upload profile picture
    },

    AI: {
        GENERATE_QUESTIONS : "/api/ai/generate-questions",//generate interview questions and answer using gemini
        GENERATE_EXPLANATION: "/api/ai/generate-explanations",//generate concept explanation using gemini

    },

    SESSION: {
        CREATE: "/api/sessions/create", //create a new interview session with questions
        GET_ALL: "/api/sessions/my-sessions", // get all user sessions
        GET_ONE: (id) => `/api/sessions/${id}` , //get session details with questions
        DELETE: (id) => `/api/sessions/${id}` , //delete a session
    },

    QUESTION: {
        ADD_TO_SESSION: "/api/questions/add", //add more questions to a session
        PIN: (id) => `/api/questions/${id}/pin`, //pin or unpin question
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`, //update/add a note to a question
    },
};
