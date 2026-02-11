import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext = createContext()
function UserContext({ children }) {
  const serverUrl = "http://localhost:8000"
  const [userData, setUserData] = useState(null)
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
      setUserData(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
      // Check for guest user in localStorage
      const guestData = localStorage.getItem('guestUser')
      if (guestData) {
        setUserData(JSON.parse(guestData))
      }
    }
  }

  const loginAsGuest = (navigate) => {
    const guestUser = {
      _id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@virtualassistant.local',
      assistantName: 'Jarvis',
      assistantImage: '/src/assets/authBg.png',
      isGuest: true,
      history: []
    }
    localStorage.setItem('guestUser', JSON.stringify(guestUser))
    setUserData(guestUser)
    navigate('/')
  }

  const getGeminiResponse = async (command) => {
    // Handle guest users with client-side responses
    if (userData && userData.isGuest) {
      // Helper function to save response to history
      const saveToHistory = (result) => {
        const updatedHistory = [...(userData.history || []), result];
        const updatedUserData = { ...userData, history: updatedHistory };
        localStorage.setItem('guestUser', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        return result;
      };

      // Simple client-side command parsing for guests
      const lowerCommand = command.toLowerCase();

      // Get current time/date
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
      const monthStr = now.toLocaleDateString('en-US', { month: 'long' });

      // Time queries
      if (lowerCommand.includes('time') || lowerCommand.includes('what time')) {
        return saveToHistory({ type: 'get-time', userInput: command, response: `It's ${timeStr}` });
      }

      // Date queries
      if (lowerCommand.includes('date') || lowerCommand.includes('what date') || lowerCommand.includes('today')) {
        return saveToHistory({ type: 'get-date', userInput: command, response: `Today is ${dateStr}` });
      }

      // Day queries
      if (lowerCommand.includes('what day') || lowerCommand.includes('which day')) {
        return saveToHistory({ type: 'get-day', userInput: command, response: `Today is ${dayStr}` });
      }

      // Month queries
      if (lowerCommand.includes('month')) {
        return saveToHistory({ type: 'get-month', userInput: command, response: `It's ${monthStr}` });
      }

      // Google search
      if (lowerCommand.includes('google') && (lowerCommand.includes('search') || lowerCommand.includes('find'))) {
        // Extract the query more carefully - look for "search/find for X" or "search/find X on google"
        let query = command;
        // Remove the wake word (Jarvis, etc) first
        query = query.replace(new RegExp(userData.assistantName, 'i'), '').trim();
        // Remove "search" or "find" and "google" keywords but preserve the actual query
        query = query.replace(/\b(search|find|google|on|for)\b/gi, '').trim();
        return saveToHistory({ type: 'google-search', userInput: query, response: `Searching Google for ${query}` });
      }

      // Open Google
      if (lowerCommand.includes('open google') || lowerCommand.includes('google open')) {
        return saveToHistory({ type: 'google-open', userInput: command, response: 'Opening Google' });
      }

      // YouTube search/play
      if (lowerCommand.includes('youtube') && (lowerCommand.includes('search') || lowerCommand.includes('play') || lowerCommand.includes('find'))) {
        // Same improved extraction for YouTube
        let query = command;
        query = query.replace(new RegExp(userData.assistantName, 'i'), '').trim();
        query = query.replace(/\b(search|find|youtube|play|on|for)\b/gi, '').trim();
        return saveToHistory({ type: 'youtube-search', userInput: query, response: `Searching YouTube for ${query}` });
      }

      // Open YouTube
      if (lowerCommand.includes('open youtube') || lowerCommand.includes('youtube open')) {
        return saveToHistory({ type: 'youtube-open', userInput: command, response: 'Opening YouTube' });
      }

      // Calculator
      if (lowerCommand.includes('calculator') || lowerCommand.includes('calc')) {
        return saveToHistory({ type: 'calculator-open', userInput: command, response: 'Opening calculator' });
      }

      // Instagram
      if (lowerCommand.includes('instagram')) {
        return saveToHistory({ type: 'instagram-open', userInput: command, response: 'Opening Instagram' });
      }

      // Facebook
      if (lowerCommand.includes('facebook')) {
        return saveToHistory({ type: 'facebook-open', userInput: command, response: 'Opening Facebook' });
      }

      // Weather
      if (lowerCommand.includes('weather')) {
        return saveToHistory({ type: 'weather-show', userInput: command, response: 'Showing weather information' });
      }

      // Clear chat
      if (lowerCommand.includes('clear') && (lowerCommand.includes('chat') || lowerCommand.includes('history'))) {
        return saveToHistory({ type: 'chat-clear', userInput: command, response: 'Clearing chat history' });
      }

      // Greetings
      if (lowerCommand.match(/\b(hello|hi|hey|good morning|good evening|good afternoon)\b/)) {
        return saveToHistory({ type: 'general', userInput: command, response: `Hello ${userData.name}! How can I help you today?` });
      }

      // Default response for unrecognized commands
      return saveToHistory({
        type: 'general',
        userInput: command,
        response: "I'm currently in guest mode with limited capabilities. I can help you with time, date, web searches, and opening popular websites. Try asking 'what time is it' or 'search Google for something.'"
      });
    }

    // For authenticated users, call the backend
    try {
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true })
      return result.data
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  }

  useEffect(() => {
    handleCurrentUser()
  }, [])
  const value = {
    serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage, getGeminiResponse, loginAsGuest
  }
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
