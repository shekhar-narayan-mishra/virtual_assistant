import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://virtual-assistant-2-98w8.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)

app.get("/", (req, res) => {
    res.send("hii")
})
app.listen(port, "0.0.0.0", () => {
    connectDb()
    console.log(`Server Started on port ${port}`)
})