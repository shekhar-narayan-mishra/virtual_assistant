import axios from "axios"

const groqResponse = async (command, assistantName, userName) => {
    try {
        const apiUrl = process.env.GROQ_API_URL
        const apiKey = process.env.GROQ_API_KEY

        const prompt = `You are ${assistantName}, an intelligent AI voice assistant created by ${userName}. 
        You are sharp, clever, helpful, and have a friendly personality. Give concise yet informative responses.
        
        CRITICAL: Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.

        JSON Schema:
        {
          "type": "general" | "google-search" | "google-open" | "youtube-search" | "youtube-play" | "youtube-open" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show" | "get-time" | "get-date" | "get-day" | "get-month" | "chat-clear",
          "userInput": "Cleaned user input (remove assistant name)",
          "response": "Natural, conversational spoken response (1-2 sentences max unless asked for details)"
        }

        Intent Guidelines:
        - "google-search": User explicitly asks to search/Google something
        - "youtube-search" / "youtube-play": User asks to search/play videos/music on YouTube
        - "chat-clear": User wants to clear chat history
        - "general": Conversational queries, knowledge questions, greetings, jokes, advice, etc.
          * For greetings: Be warm and personable ("Hello! How can I help you today?")
          * For knowledge: Provide accurate, concise answers with personality
          * For jokes/fun: Be witty and engaging
          * For advice: Be thoughtful and practical
        
        Response Style:
        - Be conversational and natural, not robotic
        - Use contractions ("I'm", "you're", "can't")
        - Add personality and warmth
        - Keep responses brief (under 30 words) unless detailed explanation is requested
        - For simple questions, give direct answers without over-explaining
        
        User input: "${command}"
        
        Respond with JSON only:`;;

        const result = await axios.post(
            apiUrl,
            {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that responds only with valid JSON objects. Never include markdown, code blocks, or any text outside the JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "llama-3.3-70b-versatile",
                "temperature": 0,
                "max_tokens": 500,
                "response_format": { "type": "json_object" }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        )

        return result.data.choices[0].message.content
    } catch (error) {
        console.log("Error calling Groq API:", error.response?.data || error.message)
        return null
    }
}

export default groqResponse
