import express from "express"
import { Login, logout, signup, updateProfile, googleLogin, githubLogin } from "../controllers/auth.controller.js"
import upload from "../middlewares/upload.middleware.js"

const authRouter = express.Router()

authRouter.post("/signup", signup)
authRouter.post("/signin", Login)
authRouter.post("/google-login", googleLogin)
authRouter.post("/github-login", githubLogin)
authRouter.post("/logout", logout)
authRouter.post("/update-profile", upload.single('assistantImage'), updateProfile)

export default authRouter