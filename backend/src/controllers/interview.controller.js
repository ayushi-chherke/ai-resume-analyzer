// const pdfParse = require("pdf-parse")
// const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
// const interviewReportModel = require("../models/interviewReport.model")



// console.log("API HIT 🔥");
// /**
//  * @description Controller to generate interview report based on user self description, resume and job description.
//  */
// async function generateInterViewReportController(req, res) {

//     const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
//     const { selfDescription, jobDescription } = req.body

//     const interViewReportByAi = await generateInterviewReport({
//         resume: resumeContent.text,
//         selfDescription,
//         jobDescription
//     })

//     const interviewReport = await interviewReportModel.create({
//         userId: req.user?.id || null,
//         resume: resumeContent.text,
//         selfDescription,
//         jobDescription,
//         matchScore: interViewReportByAi?.matchScore || 70,
//         technicalQuestions: interViewReportByAi?.technicalQuestions || [],
//         behavioralQuestions: interViewReportByAi?.behavioralQuestions || [],
//         skillGaps: interViewReportByAi?.skillGaps || [],
//         preparationPlan: interViewReportByAi?.preparationPlan || [],
//         title: interViewReportByAi?.title || "Software Developer"
//     })

//     res.status(201).json({
//         message: "Interview report generated successfully.",
//         interviewReport
//     })

// }

// /**
//  * @description Controller to get interview report by interviewId.
//  */
// async function getInterviewReportByIdController(req, res) {

//     const { interviewId } = req.params
   

//     const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

//     if (!interviewReport) {
//         return res.status(404).json({
//             message: "Interview report not found."
//         })
//     }

//     res.status(200).json({
//         message: "Interview report fetched successfully.",
//         interviewReport
//     })
// }


// /** 
//  * @description Controller to get all interview reports of logged in user.
//  */
// async function getAllInterviewReportsController(req, res) {
//     const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

//     res.status(200).json({
//         message: "Interview reports fetched successfully.",
//         interviewReports
//     })
// }


// /**
//  * @description Controller to generate resume PDF based on user self description, resume and job description.
//  */
// async function generateResumePdfController(req, res) {
//     const { interviewReportId } = req.params
  
//     const interviewReport = await interviewReportModel.findById(interviewReportId)

//     if (!interviewReport) {
//         return res.status(404).json({
//             message: "Interview report not found."
//         })
//     }

//     const { resume, jobDescription, selfDescription } = interviewReport

//     const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

//     res.set({
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
//     })

//     res.send(pdfBuffer)
// }

// module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }


const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");

const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

console.log("API HIT 🔥");

/**
 * @description Generate interview report
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        // ✅ FIX: correct pdf parsing
        const data = await pdfParse(req.file.buffer);
        const resumeText = data.text;

        const { selfDescription, jobDescription } = req.body;

        const aiReport = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            userId: req.user?.id || null, // ✅ consistent field
            resume: resumeText,
            selfDescription,
            jobDescription,
            matchScore: aiReport?.matchScore || 70,
            technicalQuestions: aiReport?.technicalQuestions || [],
            behavioralQuestions: aiReport?.behavioralQuestions || [],
            skillGaps: aiReport?.skillGaps || [],
            preparationPlan: aiReport?.preparationPlan || [],
            title: aiReport?.title || "Software Developer"
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


/**
 * @description Get report by ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { id } = req.params;

        // ✅ prevent crash
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


/**
 * @description Get all reports
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


/**
 * @description Generate resume PDF
 */
// async function generateResumePdfController(req, res) {
//     try {
//         const { id } = req.params;

//         // ✅ validate ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid ID" });
//         }

//         const interviewReport = await interviewReportModel.findById(id);

//         if (!interviewReport) {
//             return res.status(404).json({
//                 message: "Interview report not found."
//             });
//         }

//         const pdfBuffer = await generateResumePdf({
//             resume: interviewReport.resume,
//             jobDescription: interviewReport.jobDescription,
//             selfDescription: interviewReport.selfDescription
//         });

//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `attachment; filename=resume_${id}.pdf`
//         });

//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error("PDF Error:", error);
//         res.status(500).json({ message: "Error generating PDF" });
//     }
// }
async function generateResumePdfController(req, res) {
    const { id } = req.params;

    const interviewReport = await interviewReportModel.findById(id);

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${id}.pdf`
    });

    res.send(pdfBuffer);
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};