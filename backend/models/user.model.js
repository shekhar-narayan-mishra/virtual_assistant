import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // User's full name
    name: {
        type: String,
        required: true
    },
    // Unique user email for identification
    email: {
        type: String,
        required: true
    },
    // Salted and hashed password (optional for Google OAuth users)
    password: {
        type: String,
        required: false
    },
    // Unique Google ID for OAuth authentication
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Unique GitHub ID for OAuth authentication
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Personalized name for the AI Assistant
    assistantName: {
        type: String
    },
    // URL or path to the assistant's avatar image
    assistantImage: {
        type: String
    },
    // Array of interaction history IDs or strings
    history: [
        { type: String }
    ]

}, { timestamps: true })

const User =mongoose.model("User",userSchema)
export default User

