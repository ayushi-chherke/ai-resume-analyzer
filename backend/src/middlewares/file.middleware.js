const multer = require("multer")
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory as Buffer objects
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB file size limit
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
            return cb(new Error("Please upload a PDF or Word document"))
        }
        cb(null, true)
    }
})
module.exports =  upload 