import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

/**
 * @description Generate interview report
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};


/**
 * @description Get interview report by ID
 */
export const getInterviewReportById = async (id) => {
    const response = await api.get(`/api/interview/report/${id}`);
    return response.data;
};


/**
 * @description Get all interview reports
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};


/**
 * @description Generate & download resume PDF
 */
export const generateResumePdf = async (id) => {
    const response = await api.get(`/api/interview/resume/pdf/${id}`, {
        responseType: "blob",
    });

    return response.data;
};