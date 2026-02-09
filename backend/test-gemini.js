import dotenv from "dotenv"
dotenv.config()
import geminiResponse from "./gemini.js"

async function testGemini() {
    console.log("Testing Gemini API...\n")
    
    try {
        console.log("Test 1: General Question")
        console.log("User Input: What is the capital of France?")
        const response1 = await geminiResponse("What is the capital of France?", "Assistant", "Shekhar")
        console.log("Response:", response1)
        console.log("\n" + "=".repeat(50) + "\n")
        
        console.log("Test 2: YouTube Search")
        console.log("User Input: Search for React tutorials on YouTube")
        const response2 = await geminiResponse("Search for React tutorials on YouTube", "Assistant", "Shekhar")
        console.log("Response:", response2)
        console.log("\n" + "=".repeat(50) + "\n")
        
        console.log("Test 3: Get Time")
        console.log("User Input: What time is it?")
        const response3 = await geminiResponse("What time is it?", "Assistant", "Shekhar")
        console.log("Response:", response3)
        console.log("\n" + "=".repeat(50) + "\n")
        
        console.log("✅ All tests completed successfully!")
        
    } catch (error) {
        console.error("❌ Error during testing:")
        console.error(error.message)
        if (error.response) {
            console.error("API Response:", error.response.data)
        }
    }
}

testGemini()
