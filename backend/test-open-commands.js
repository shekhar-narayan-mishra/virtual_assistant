import dotenv from "dotenv"
dotenv.config()
import groqResponse from "./grok.js"

async function testOpenCommands() {
    console.log("Testing 'Open' Commands...\n")
    
    try {
        // Test 1: Open YouTube
        console.log("Test 1: Open YouTube")
        console.log("User Input: open YouTube")
        const response1 = await groqResponse("open YouTube", "Assistant", "Shekhar")
        console.log("Response:", response1)
        const result1 = JSON.parse(response1)
        console.log("Type:", result1.type)
        console.log("Expected: youtube-open")
        console.log("\n" + "=".repeat(50) + "\n")
        
        // Test 2: Search on YouTube
        console.log("Test 2: Search on YouTube")
        console.log("User Input: search React tutorials on YouTube")
        const response2 = await groqResponse("search React tutorials on YouTube", "Assistant", "Shekhar")
        console.log("Response:", response2)
        const result2 = JSON.parse(response2)
        console.log("Type:", result2.type)
        console.log("Expected: youtube-search")
        console.log("\n" + "=".repeat(50) + "\n")
        
        // Test 3: Open Google
        console.log("Test 3: Open Google")
        console.log("User Input: open Google")
        const response3 = await groqResponse("open Google", "Assistant", "Shekhar")
        console.log("Response:", response3)
        const result3 = JSON.parse(response3)
        console.log("Type:", result3.type)
        console.log("Expected: google-open")
        console.log("\n" + "=".repeat(50) + "\n")
        
        console.log("✅ All tests completed!")
        
    } catch (error) {
        console.error("❌ Error during testing:")
        console.error(error.message)
        if (error.response) {
            console.error("API Response:", error.response.data)
        }
    }
}

testOpenCommands()
