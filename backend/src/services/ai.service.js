const Groq = require("groq-sdk");
const { z } = require("zod");
// const puppeteer = require("puppeteer");
// const PDFDocument = require("pdfkit");

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ---------------- SCHEMAS ----------------
// We keep your Zod schemas for validation after the AI response

const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intension: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intension: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string(),
});

const resumePdfSchema = z.object({
    html: z.string()
});

// ---------------- HELPERS ----------------

async function generatePdfFromHtml(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            timeout: 0
          });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
        });
    } finally {
        if (browser) await browser.close();
    }
}

// ---------------- MAIN SERVICES ----------------

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        const prompt = `
        You are an expert HR Analyst and Technical Interviewer.
        
        Generate a HIGHLY ACCURATE and DETAILED interview report based on:
        
        Resume: ${resume || "Not provided"}
        Self Description: ${selfDescription || "Not provided"}
        Job Description: ${jobDescription || "Not provided"}
        
        -----------------------------------
        SCORING RULE (VERY IMPORTANT):
        
        Calculate matchScore based on:
        - Skills match with job description (40%)
        - Experience relevance (30%)
        - Projects / technical depth (20%)
        - Communication / clarity (10%)
        
        Scoring Guide:
        - 90-100 → Excellent match
        - 75-89 → Strong match
        - 60-74 → Moderate match
        - 40-59 → Weak match
        - below 40 → Poor match
        
        DO NOT use default values.
        Score MUST vary based on input.
        
        -----------------------------------
        QUESTION GENERATION RULES:
        
        - Generate at least 5–7 TECHNICAL questions
        - Generate at least 4–5 BEHAVIORAL questions
        - Questions must be relevant to the job role
        - Mix difficulty: easy + medium + hard
        - "intension" must clearly explain what is being tested
        
        -----------------------------------
        SKILL GAP RULES:
        
        - Identify REAL missing or weak skills
        - Avoid generic skills like "communication" unless necessary
        - Severity must be realistic
        
        -----------------------------------
        PREPARATION PLAN (7 DAYS):
        
        - Create a 7-day structured plan
        - Each day must include:
          - focus area
          - 3–5 actionable tasks
        - Plan should directly address skill gaps
        - Make it practical (coding, projects, revision)
        
        -----------------------------------
        OUTPUT FORMAT (STRICT JSON):
        
        {
          "matchScore": number,
          "technicalQuestions": [
            {
              "question": "string",
              "intension": "string",
              "answer": "string"
            }
          ],
          "behavioralQuestions": [
            {
              "question": "string",
              "intension": "string",
              "answer": "string"
            }
          ],
          "skillGaps": [
            {
              "skill": "string",
              "severity": "low" | "medium" | "high"
            }
          ],
          "preparationPlan": [
            {
              "day": number,
              "focus": "string",
              "tasks": ["string"]
            }
          ],
          "title": "string"
        }
        
        -----------------------------------
        STRICT RULES:
        
        - DO NOT skip any field
        - ALWAYS include "intension"
        - NEVER return null or undefined
        - NEVER return explanation or markdown
        - RETURN ONLY VALID JSON
        - If unsure, still generate best possible structured output
        `;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // High intelligence model
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }, // 🔥 Forces JSON mode
            temperature: 0.2,
        });

        const rawJson = JSON.parse(response.choices[0]?.message?.content);

        // Validate with Zod to ensure the structure is exactly what your frontend expects
        return interviewReportSchema.parse(rawJson);

    } catch (error) {
        console.error("Groq Interview Report Error:", error);
        // Fallback to prevent UI crash
        return {
            matchScore: 0,
            technicalQuestions: [],
            behavioralQuestions: [],
            skillGaps: [{ skill: "Analysis failed", severity: "high" }],
            preparationPlan: [],
            title: "Error analyzing profile"
        };
    }
}

const PDFDocument = require("pdfkit");

// function generateResumePdf() {
//     return new Promise((resolve, reject) => {

//         const doc = new PDFDocument();
//         const buffers = [];

//         doc.on("data", (chunk) => buffers.push(chunk));

//         doc.on("end", () => {
//             console.log("PDF GENERATED ✅");
//             resolve(Buffer.concat(buffers));
//         });

//         doc.on("error", (err) => {
//             console.log("PDF ERROR ❌", err);
//             reject(err);
//         });

//         // 🔥 Simple content (test)
//         doc.fontSize(20).text("PDF WORKING TEST", 100, 100);

//         doc.end(); // MUST be last
//     });
// }


async function generateResumePdf({ resume, jobDescription, selfDescription, userData = {}, template = 'classic' }) {
    const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50, // Standard professional margin
        bufferPages: true 
    });
    
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const fonts = {
        bold: "Times-Bold",
        regular: "Times-Roman",
        italic: "Times-Italic",
        mono: "Courier"
    };

    const colors = {
        primary: "#111111",
        secondary: "#444444",
        accent: "#2c3e50",
        text: "#333333",
        light: "#666666"
    };

    // ===== PAGE OVERLAP PROTECTION =====
    const SAFE_BOTTOM_MARGIN = 750; // Points from top before breaking page

    const checkPageBreak = (neededSpace = 20) => {
        if (doc.y + neededSpace > SAFE_BOTTOM_MARGIN) {
            doc.addPage();
            // If modern template, redraw sidebar background on new page
            if (template === 'modern') {
                const currentY = doc.y;
                doc.rect(0, 0, 170, 1000).fill("#f4f4f4");
                doc.y = currentY; 
            }
            return true;
        }
        return false;
    };

    const clean = (t) => t.replace(/[^\x20-\x7E\n]/g, "").trim();

    const renderSectionTitle = (title, x, width) => {
        checkPageBreak(50);
        doc.moveDown(1);
        doc.fillColor(colors.primary).font(fonts.bold).fontSize(11).text(title.toUpperCase(), x);
        doc.moveTo(x, doc.y + 2).lineTo(x + width, doc.y + 2).strokeColor("#dddddd").lineWidth(0.5).stroke();
        doc.moveDown(0.6);
    };

    const processContent = (startX, width) => {
        const lines = resume.split("\n");
        
        if (selfDescription) {
            renderSectionTitle("PROFESSIONAL SUMMARY", startX, width);
            doc.fillColor(colors.text).font(fonts.regular).fontSize(10)
               .text(clean(selfDescription), startX, doc.y, { width, align: 'justify', lineGap: 3 });
        }

        lines.forEach(line => {
            const text = clean(line);
            if (!text || text.toLowerCase() === userData.name?.toLowerCase()) return;

            checkPageBreak(15); // Check before every line

            if (text.length < 30 && /^[A-Z\s]{4,}$/.test(text)) {
                renderSectionTitle(text, startX, width);
            } 
            else if (text.includes("|") || text.includes("–") || (text.length < 60 && text.split(" ").length < 12)) {
                doc.moveDown(0.5);
                doc.fillColor(colors.secondary).font(fonts.bold).fontSize(10.5).text(text, startX, doc.y, { width });
            } 
            else {
                const isBullet = text.startsWith("•") || text.startsWith("-");
                const content = isBullet ? text.substring(1).trim() : text;
                doc.fillColor(colors.text).font(fonts.regular).fontSize(9.5)
                   .text(isBullet ? `•  ${content}` : content, startX + (isBullet ? 12 : 0), doc.y, {
                       width: isBullet ? width - 12 : width,
                       lineGap: 2,
                       align: 'justify'
                   });
                doc.moveDown(0.2);
            }
        });
    };

    // ===== TEMPLATES =====
    const renderClassic = () => {
        const margin = 50;
        doc.fillColor(colors.primary).font(fonts.bold).fontSize(24).text((userData.name || "Resume").toUpperCase(), { align: 'center' });
        doc.moveDown(0.2);
        doc.fillColor(colors.secondary).font(fonts.regular).fontSize(10).text(userData.title || "", { align: 'center' });
        const info = [userData.email, userData.phone, userData.linkedin].filter(Boolean).join("  •  ");
        doc.fillColor(colors.light).font(fonts.mono).fontSize(8).text(info, { align: 'center' });
        doc.moveDown(1.5);
        processContent(margin, 495);
    };

    const renderModern = () => {
        const sidebarWidth = 170;
        const mainX = 200;
        const mainWidth = 345;

        doc.rect(0, 0, sidebarWidth, 1000).fill("#f4f4f4");
        doc.fillColor(colors.primary).font(fonts.bold).fontSize(18).text(userData.name || "Resume", 25, 50, { width: sidebarWidth - 40 });
        doc.fillColor(colors.accent).font(fonts.italic).fontSize(10).text(userData.title || "", 25, doc.y + 5);
        
        doc.moveDown(2);
        const contactItem = (label, val) => {
            if (!val) return;
            doc.fillColor(colors.primary).font(fonts.bold).fontSize(8).text(label, 25);
            doc.fillColor(colors.text).font(fonts.mono).fontSize(7.5).text(val, 25).moveDown(1);
        };
        contactItem("CONTACT", userData.phone);
        contactItem("EMAIL", userData.email);
        contactItem("LINKEDIN", userData.linkedin);

        doc.y = 50; 
        processContent(mainX, mainWidth);
    };

    if (template === 'modern') renderModern();
    else renderClassic();

    doc.end();
    return new Promise((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
    });
}

module.exports = generateResumePdf;
// async function generateResumePdf({ resume, jobDescription, selfDescription }) {

//     const doc = new PDFDocument({ margin: 50 });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     // ✅ Title
//     doc.fontSize(20).text("Generated Resume", { align: "center" });

//     doc.moveDown();

//     // ✅ Self Description
//     doc.fontSize(14).text("Self Description", { underline: true });
//     doc.moveDown(0.5);
//     doc.fontSize(11).text(selfDescription || "Not provided", {
//         width: 500,
//         align: "left"
//     });

//     doc.moveDown();

//     // ✅ Job Description
//     doc.fontSize(14).text("Job Description", { underline: true });
//     doc.moveDown(0.5);
//     doc.fontSize(11).text(jobDescription || "Not provided", {
//         width: 500
//     });

//     doc.moveDown();

//     // ✅ Resume (FIXED HANDLING)
//     doc.fontSize(14).text("Resume Content", { underline: true });
//     doc.moveDown(0.5);

//     const cleanResume = resume
//         .replace(/\n\s*\n/g, "\n")   // remove extra line breaks
//         .replace(/\s+/g, " ");      // normalize spaces

//     doc.fontSize(10).text(cleanResume.substring(0, 3000), {
//         width: 500,
//         align: "left"
//     });

//     doc.end();

//     return new Promise((resolve) => {
//         doc.on("end", () => {
//             resolve(Buffer.concat(buffers));
//         });
//     });
// }
// async function generatePdfFromHtml(htmlContent) {
//     let browser;
//     try {
//         browser = await puppeteer.launch({
//             headless: "new", // Modern headless mode
//             args: [
//                 "--no-sandbox", 
//                 "--disable-setuid-sandbox",
//                 "--font-render-hinting=none" // Helps with Mac font issues
//             ],
//             executablePath: null, // Let puppeteer find its own Chromium
//         });
        
//         const page = await browser.newPage();
        
//         // IMPORTANT: Set a timeout and wait for everything to load
//         await page.setContent(htmlContent, { 
//             waitUntil: "networkidle0", 
//             timeout: 30000 
//         });

//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//             margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
//         });

//         return pdfBuffer;
//     } catch (error) {
//         console.error("PUPPETEER ERROR:", error);
//         throw error;
//     } finally {
//         if (browser) await browser.close();
//     }
// }

module.exports = { generateInterviewReport,generateResumePdf};