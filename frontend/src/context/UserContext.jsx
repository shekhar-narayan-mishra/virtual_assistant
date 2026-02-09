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
      // User not logged in or DB error - Enable Guest Mode
      console.log("User not authenticated or DB error, enabling Guest Mode")

      const savedGuest = localStorage.getItem("guestProfile");
      if (savedGuest) {
        setUserData(JSON.parse(savedGuest));
      } else {
        const defaultGuest = {
          _id: "guest",
          name: "Guest",
          assistantName: "Jarvis",
          assistantImage: "https://static.vecteezy.com/system/resources/previews/000/420/940/original/vector-users-icon.jpg",
          history: []
        };
        setUserData(defaultGuest);
        localStorage.setItem("guestProfile", JSON.stringify(defaultGuest));
      }
    }
  }

  const updateGuestProfile = (newHistory) => {
    setUserData(prevData => {
      const updatedGuestData = { ...prevData, history: newHistory };
      localStorage.setItem("guestProfile", JSON.stringify(updatedGuestData));
      return updatedGuestData;
    });
  };

  const getGeminiResponse = async (command) => {
    try {
      let result;
      if (userData?._id === "guest") {
        result = await axios.post(`${serverUrl}/api/user/ask-guest`, { command });
      } else {
        result = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true });
      }
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
    serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage, selectedImage, setSelectedImage, getGeminiResponse
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
