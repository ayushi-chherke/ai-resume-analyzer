const mongoose = require('mongoose');

/**
 * @JobDescription: The job description provided by the user, which will be analyzed to generate the interview report.
 * @SelfDescription: The self description provided by the user, which will be analyzed to generate the interview report.
 * @Resume: The resume file uploaded by the user, which will be analyzed to generate the interview report.
 * @TechnicalQuestions: An array of technical questions generated based on the job description and user profile.
 * @BehavioralQuestions: An array of behavioral questions generated based on the job description and user profile.
 * @PreparationPlan: An array of preparation steps generated based on the job description and user profile, typically structured as a day-by-day roadmap.
 * @SkillGaps: An array of identified skill gaps based on the analysis of the job description and user profile, which can be used to tailor the preparation plan.
 * @MatchScore: A numerical score representing how well the user's profile matches the job description, which can be used to provide feedback and tailor the preparation plan.
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"]
    },
    intension: {
        type: String,
        required: [true, "Question intension is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    },
 },
  {
        _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral question is required"]
    },
    intension: {
        type: String,
        required: [true, "Question intension is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    },
 },
  {
        _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill gap is required"]
    },
 
 severity: {

        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, "Skill gap severity is required"]
 },
},
  {
        _id: false
});

const preparationStepSchema = new mongoose.Schema({ 
    day: {
        type: Number,
        required: [true, "Preparation step day is required"]
    },
    tasks: {
        type: [String],
        required: [true, "Preparation step tasks are required"]
    },
    focus: {
        type: String,
        required: [true, "Preparation step focus is required"]
},
},
  {
        _id: false
});

const interviewReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    selfDescription: {
        type: String,
    },
    resume: {
        type: String,
        // required: false
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    preparationPlan: [preparationStepSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationStepSchema]
},
{ 
    timestamps: true 
});

const interviewReportModel = mongoose.model("interviewReports", interviewReportSchema);

module.exports = interviewReportModel;
