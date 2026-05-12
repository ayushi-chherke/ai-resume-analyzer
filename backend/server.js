require("dotenv").config();
const app = require('./src/app');
const invokeGeminiAI=require('./src/services/ai.service');

const connectDB = require('./src/config/database');
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
connectDB();

