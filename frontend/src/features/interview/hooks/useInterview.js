// import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
// import { useContext} from "react"
// import { InterviewContext } from "../interview.context"
// import { useParams } from "react-router"


// export const useInterview = () => {

//     const context = useContext(InterviewContext)
//     const { id } = useParams()

//     if (!context) {
//         throw new Error("useInterview must be used within an InterviewProvider")
//     }

//     const { loading, setLoading, report, setReport, reports, setReports } = context

//     const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
//         setLoading(true)
//         let response = null
//         try {
//             response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
//             setReport(response.interviewReport)
//         } catch (error) {
//             console.log(error)
//         } finally {
//             setLoading(false)
//         }

//         return response.interviewReport
//     }

//     const getReportById = async (interviewId) => {
//         setLoading(true)
//         let response = null
//         try {
//             response = await getInterviewReportById(interviewId)
//             setReport(response.interviewReport)
//         } catch (error) {
//             console.log(error)
//         } finally {
//             setLoading(false)
//         }
//         return response.interviewReport
//     }

//     const getReports = async () => {
//         setLoading(true)
//         let response = null
//         try {
//             response = await getAllInterviewReports()
//             setReports(response.interviewReports)
//         } catch (error) {
//             console.log(error)
//         } finally {
//             setLoading(false)
//         }

//         return response.interviewReports
//     }

//     const getResumePdf = async (interviewReportId) => {
//         setLoading(true);
    
//         try {
//             const blob = await generateResumePdf(interviewReportId);
    
//             console.log("BLOB:", blob); // debug
    
//             if (!blob || blob.size === 0) {
//                 console.error("Empty PDF");
//                 return;
//             }
    
//             const url = window.URL.createObjectURL(blob);
    
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = `resume_${interviewReportId}.pdf`;
    
//             document.body.appendChild(link);
//             link.click();
    
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
    
//         } catch (error) {
//             console.log("Download error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

// }

import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext} from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { id } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        console.log("ID SENT:", interviewReportId);

        setLoading(true);
        try {
            const response = await generateResumePdf( interviewReportId );
            
            // DEBUG: Check if response is actually data
            if (!response) throw new Error("No data received from server");
    
            const blob = new Blob([response], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = `resume_${interviewReportId}.pdf`;
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("PDF Download Error:", error);
        } finally {
            setLoading(false);
        }
    }
    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}