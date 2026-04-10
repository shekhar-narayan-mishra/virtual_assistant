import { createContext, useState } from "react";

export const UserDataContext = createContext();

function UserContext({ children }) {
  const ServerUrl = import.meta.env.VITE_API_URL || "https://virtual-assistant-zens.onrender.com"

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    if (token && userId) {
      return { _id: userId, name: userName, token }
    }
    return null
  })

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    setUser(null)
  }

  const value = {
    ServerUrl,
    user,
    setUser,
    logout
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
