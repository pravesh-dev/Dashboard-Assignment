import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from './src/routes/auth.js';
// import taskRoutes from './src/routes/task.js';
// import { authMiddleware } from './src/middleware/auth.js';

import connectDB from './src/config/mongodb.js';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 5000;

connectDB();
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173",credentials: true}));
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/tasks", authMiddleware, taskRoutes);

// API endpoint to test if the API is working
app.get('/', (req, res)=>{
    res.send("API Working")
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});
