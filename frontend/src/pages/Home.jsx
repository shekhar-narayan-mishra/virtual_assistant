import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { IoMic, IoMicOff } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { BsChatDots } from "react-icons/bs";
import ChatBubble from '../components/ChatBubble';
import VoiceVisualizer from '../components/VoiceVisualizer';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [isMicOn, setIsMicOn] = useState(false) // Default to false (silent start)
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [userData?.history, userText, aiText])

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const handleClearHistory = async () => {
    try {
      // Check if user is a guest
      if (userData && userData.isGuest) {
        // For guest users, just clear localStorage and update state
        const clearedUserData = { ...userData, history: [] };
        localStorage.setItem('guestUser', JSON.stringify(clearedUserData));
        setUserData(clearedUserData);
        setHam(false);
        setChatOpen(false);
      } else {
        // For authenticated users, call the API
        await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true })
        setUserData(prev => ({ ...prev, history: [] }))
        setHam(false)
        setChatOpen(false)
      }
    } catch (error) {
      console.error("Failed to clear history", error)
    }
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  }

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }


    isSpeakingRef.current = true
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition(); // ⏳ Delay se race condition avoid hoti hai
      }, 800);
    }
    synth.cancel(); // 🛑 pehle se koi speech ho to band karo
    synth.speak(utterence);
  }

  const handleCommand = (data) => {
    if (!data) return;

    const { type, userInput, response } = data
    speak(response);

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }

    if (type === 'google-open') {
      window.open(`https://www.google.com/`, '_blank');
    }

    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }

    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }

    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }

    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-open') {
      window.open(`https://www.youtube.com/`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

    if (type === 'chat-clear') {
      handleClearHistory();
    }
  }

  useEffect(() => {
    if (!userData || !userData.assistantName) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported. Please use Chrome/Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Changed to false for better control
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startListening = () => {
      // Only start if Mic is ON, component mounted, not speaking, not already recognizing
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current && isMicOn) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore "already started" errors but log others
          if (e.name !== 'InvalidStateError') console.error("Start error:", e);
        }
      }
    };

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      // Automatically restart if not speaking and component is mounted AND Mic is still ON
      if (isMounted && !isSpeakingRef.current && isMicOn) {
        setTimeout(startListening, 500);
      }
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error === 'not-allowed') {
        // Do not restart if permission denied
        console.error("Microphone access denied");
        return;
      }
      // For other errors like 'no-speech', restart after delay if Mic is ON
      if (isMounted && !isSpeakingRef.current && isMicOn) {
        setTimeout(startListening, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setUserText(transcript);

        // Stop recognition while processing
        isSpeakingRef.current = true;

        const data = await getGeminiResponse(transcript);

        if (data) {
          setAiText(data.response);
          handleCommand(data);
        } else {
          // Fallback if API fails
          setAiText("I couldn't connect to the server.");
          speak("I couldn't connect to the server.");
        }

        // speak() function handles restarting recognition when done
      }
    };

    // Initial start or stop based on isMicOn
    if (isMicOn) {
      startListening();
    } else {
      recognition.stop();
      setListening(false);
    }

    // Initial Greeting
    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, I'm online.`);
    greeting.lang = 'hi-IN'; // Keeping hindi accent as per legacy code
    // window.speechSynthesis.speak(greeting); // Optional: can be annoying on every reload

    return () => {
      isMounted = false;
      recognition.stop();
    };
  }, [userData, isMicOn]); // Added isMicOn dependency




  return (
    <div className='w-full h-[100vh] bg-gray-900 flex flex-col items-center justify-between relative overflow-hidden'>

      {/* Header / Sidebar Toggle */}
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[30px] h-[30px] z-50 cursor-pointer' onClick={() => setHam(true)} />

      {/* Mobile Hamburger Sidebar */}
      <div className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-transform transform ${ham ? "translate-x-0" : "translate-x-full"} lg:hidden flex justify-end`}>
        <div className='w-[80%] max-w-[300px] h-full bg-gray-800 p-6 shadow-2xl flex flex-col gap-6'>
          <RxCross1 className='text-white w-[30px] h-[30px] cursor-pointer self-end' onClick={() => setHam(false)} />
          <div className='flex flex-col gap-4 mt-10'>
            <button className='w-full py-3 bg-white rounded-xl text-black font-semibold hover:bg-gray-200 transition' onClick={() => navigate("/customize")}>Customize</button>
            <button className='w-full py-3 border border-white rounded-xl text-white font-semibold hover:bg-white/10 transition' onClick={handleLogOut}>Log Out</button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${chatOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setChatOpen(false)}>
        <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 shadow-2xl transform transition-transform ${chatOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
          {/* Chat Header */}
          <div className='flex items-center justify-between p-6 border-b border-slate-700'>
            <div className='flex items-center gap-3'>
              <BsChatDots className='text-blue-400 text-2xl' />
              <h2 className='text-white text-xl font-semibold'>Chat</h2>
            </div>
            <div className='flex items-center gap-3'>
              <button className='p-2 hover:bg-slate-700 rounded-lg transition text-red-400 hover:text-red-300' onClick={handleClearHistory} title="Clear History">
                <MdDelete className='text-xl' />
              </button>
              <button className='p-2 hover:bg-slate-700 rounded-lg transition' onClick={() => setChatOpen(false)}>
                <RxCross1 className='text-white text-xl' />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className='flex-1 overflow-y-auto p-6 h-[calc(100vh-88px)] flex flex-col gap-2'>
            {userData && userData.history && userData.history.length > 0 ? (
              userData.history.map((msg, index) => (
                typeof msg === 'object' ? (
                  <ChatBubble key={index} role={msg.role} content={msg.content} />
                ) : (
                  <div key={index} className="text-gray-400 text-xs text-center py-1">Legacy: {msg}</div>
                )
              ))
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-500 text-sm'>No messages yet.</div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Desktop Controls (Top Right) */}
      <div className='hidden lg:flex absolute top-6 right-6 gap-4'>
        <button className='px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition' onClick={() => navigate("/customize")}>Customize</button>
        <button className='px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition' onClick={handleLogOut}>Log Out</button>
      </div>

      {/* Main Visualizer Area */}
      <div className='w-full flex-1 flex flex-col items-center justify-center p-4'>
        {/* Center Visualizer / Assistant Info */}
        <div className='flex flex-col items-center justify-center gap-6'>
          {listening && isMicOn ? (
            <VoiceVisualizer isActive={true} />
          ) : (
            <div className='flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity'>
              <div className='w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-lg mb-3 bg-gradient-to-br from-gray-800 to-gray-900'>
                <img
                  src={userData?.assistantImage || '/src/assets/ai.gif'}
                  alt="Assistant"
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23374151"/%3E%3Ctext x="50" y="58" font-size="40" text-anchor="middle" fill="%239CA3AF"%3EAI%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <h2 className='text-white text-lg font-medium tracking-wide'>I am {userData?.assistantName || "Assistant"}</h2>
              <p className='text-gray-400 text-sm mt-2'>
                {isMicOn ? "Say my name to start..." : "Tap mic to start"}
              </p>
            </div>
          )}

          {/* Subtitles - What user said and what AI is saying */}
          {(userText || aiText) && (
            <div className='mt-8 max-w-2xl mx-auto text-center space-y-3'>
              {userText && (
                <div className='bg-white/5 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/10'>
                  <p className='text-gray-400 text-xs uppercase tracking-wider mb-1'>You said</p>
                  <p className='text-white text-base font-light'>{userText}</p>
                </div>
              )}
              {aiText && (
                <div className='bg-blue-500/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-500/20'>
                  <p className='text-blue-400 text-xs uppercase tracking-wider mb-1'>{userData?.assistantName || "Assistant"}</p>
                  <p className='text-white text-base font-light'>{aiText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className='absolute bottom-0 w-full p-6 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent flex items-center justify-center gap-6'>

        {/* Chat Toggle Button */}
        <button
          className='w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white flex items-center justify-center text-2xl shadow-lg transition-all transform hover:scale-105'
          onClick={() => setChatOpen(!chatOpen)}
          title="Toggle Chat"
        >
          <BsChatDots />
        </button>

        {/* Mic Button */}
        <button
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all transform hover:scale-110 ${isMicOn
            ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.6)] scale-105'
            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          onClick={() => setIsMicOn(!isMicOn)}
          title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
        >
          {isMicOn ? <IoMic /> : <IoMicOff />}
        </button>

        {/* Status Text */}
        <div className='w-14 h-14 flex items-center justify-center'>
          <p className='text-gray-500 text-xs font-medium text-center leading-tight'>
            {listening && isMicOn ? (
              <span className='text-blue-400 animate-pulse'>Listening</span>
            ) : isMicOn ? (
              <span>Ready</span>
            ) : (
              <span>Off</span>
            )}
          </p>
        </div>
      </div>

    </div>
  )
}

export default Home