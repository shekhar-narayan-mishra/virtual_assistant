import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import groqResponse from "./grok.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "https://virtual-assistant-2-98w8.onrender.com"]
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL)
}
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")))

// SPA catch-all: serve index.html for any non-API route
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"))
})

app.listen(port, () => {
    connectDb()
    console.log("server started")
})
