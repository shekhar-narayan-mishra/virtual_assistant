import dotenv from "dotenv"
dotenv.config()
import groqResponse from "./grok.js"

async function testGroq() {
    console.log("Testing Groq API...\n")
    console.log("API URL:", process.env.GROQ_API_URL)
    console.log("API Key:", process.env.GROQ_API_KEY ? "✓ Set" : "✗ Not set")
    console.log("\n" + "=".repeat(50) + "\n")
    
    try {
        // Test 1: Simple general question
        console.log("Test 1: General Question")
        console.log("User Input: What is the capital of France?")
        const response1 = await groqResponse("What is the capital of France?", "Assistant", "Shekhar")
        console.log("Response:", response1)
        console.log("\n" + "=".repeat(50) + "\n")
        
        // Test 2: YouTube search
        console.log("Test 2: YouTube Search")
        console.log("User Input: Search for React tutorials on YouTube")
        const response2 = await groqResponse("Search for React tutorials on YouTube", "Assistant", "Shekhar")
        console.log("Response:", response2)
        console.log("\n" + "=".repeat(50) + "\n")
        
        // Test 3: Get time
        console.log("Test 3: Get Time")
        console.log("User Input: What time is it?")
        const response3 = await groqResponse("What time is it?", "Assistant", "Shekhar")
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

testGroq()
