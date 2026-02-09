import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { IoMic, IoMicOff, IoChatbubbleEllipses } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import VoiceVisualizer from '../components/VoiceVisualizer';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [inputText, setInputText] = useState("") // New state for text input
  const [aiText, setAiText] = useState("")
  const [isMicOn, setIsMicOn] = useState(true) // Default to true (auto-start listening)
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
      if (userData?._id === "guest") {
        setUserData(prev => ({ ...prev, history: [] }));
        localStorage.setItem("guestProfile", JSON.stringify({ ...userData, history: [] }));
        setChatOpen(false);
        setHam(false);
        return;
      }
      await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true })
      setUserData(prev => ({ ...prev, history: [] }))
      setHam(false)
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
    utterence.lang = 'en-US';
    utterence.rate = 1.1; // Slightly faster for more natural speech
    utterence.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(v => v.lang.startsWith('en-'));
    if (englishVoice) {
      utterence.voice = englishVoice;
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

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const command = inputText.trim();
    setInputText("");
    setUserText(command);

    // Optimistic UI update
    // userData.history.push({ role: "user", content: command }); // Don't do this directly if context handles it via API result? 
    // Actually UserContext doesn't auto-update history on API call, backend does. But for guest, we need to handle it?
    // The previous implementation of `getGeminiResponse` returns data but doesn't update context history automatically for guest?
    // Wait, the guest logic in `UserContext` only returns data. `handleCommand` expects `data`. 
    // We might need to manually update history for Guest?
    // Let's check `UserContext` again. `updateGuestProfile` was added but not called in `getGeminiResponse`.

    const data = await getGeminiResponse(command);

    if (data) {
      setAiText(data.response);
      handleCommand(data);
      if (userData?._id === "guest") {
        // Manually update history for guest because backend doesn't save it to DB
        const newHistory = [...userData.history, { role: "user", content: command }, { role: "assistant", content: data.response }];
        // We need a way to update userData history. I added `updateGuestProfile` in UserContext but need to expose it or use setUserData.
        // Let's just use userDataContext's setUserData which is available here.
        setUserData(prev => {
          const updated = { ...prev, history: newHistory };
          localStorage.setItem("guestProfile", JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      setAiText("I couldn't connect to the server.");
      speak("I couldn't connect to the server.");
    }
  }

  const handleCommand = (data) => {
    if (!data) return;

    setUserText(""); // Clear user text after command is processed

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
      const lowerTranscript = transcript.toLowerCase();
      const assistantNameLower = userData.assistantName.toLowerCase();

      // Check if wake word is detected
      if (lowerTranscript.includes(assistantNameLower)) {
        // Extract command (remove wake word)
        const command = transcript.replace(new RegExp(userData.assistantName, 'gi'), '').trim();

        setUserText(transcript);
        setAiText(""); // Clear previous AI response

        // Stop recognition while processing
        isSpeakingRef.current = true;
        recognition.stop();

        const data = await getGeminiResponse(command || transcript);

        if (data) {
          setAiText(data.response);
          handleCommand(data);

          // Add voice conversation to history
          if (userData?._id === "guest") {
            const newHistory = [
              ...userData.history,
              { role: "user", content: transcript },
              { role: "assistant", content: data.response }
            ];
            setUserData(prev => {
              const updated = { ...prev, history: newHistory };
              localStorage.setItem("guestProfile", JSON.stringify(updated));
              return updated;
            });
          }

          // Speak will handle restarting recognition
        } else {
          // Fallback if API fails
          const errorMsg = "I couldn't connect to the server.";
          setAiText(errorMsg);
          speak(errorMsg);
        }
      } else {
        // No wake word detected, show feedback briefly then clear
        setUserText(transcript);
        setTimeout(() => {
          setUserText("");
        }, 2000);
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

      {/* Sidebar */}
      <div className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-transform transform ${ham ? "translate-x-0" : "translate-x-full"} lg:hidden flex justify-end`}>
        <div className='w-[80%] max-w-[300px] h-full bg-gray-800 p-6 shadow-2xl flex flex-col gap-6'>
          <RxCross1 className='text-white w-[30px] h-[30px] cursor-pointer self-end' onClick={() => setHam(false)} />
          <div className='flex flex-col gap-4 mt-10'>
            <button className='w-full py-3 bg-red-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition' onClick={handleClearHistory}><MdDelete /> Clear History</button>
            <button className='w-full py-3 bg-white rounded-xl text-black font-semibold hover:bg-gray-200 transition' onClick={() => navigate("/customize")}>Customize</button>
            <button className='w-full py-3 border border-white rounded-xl text-white font-semibold hover:bg-white/10 transition' onClick={handleLogOut}>Log Out</button>
          </div>
        </div>
      </div>

      {/* Desktop Controls (Top Right) */}
      <div className='hidden lg:flex absolute top-6 right-6 gap-4'>
        <button className='px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition' onClick={handleLogOut}>Log Out</button>
        <button className='px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition' onClick={() => navigate("/customize")}>Customize</button>
        <button className='px-6 py-2 bg-red-500/80 text-white rounded-full flex items-center gap-2 hover:bg-red-500 transition' onClick={handleClearHistory}><MdDelete /> Clear</button>
      </div>

      {/* Main Visualizer Area - Simplified like reference */}
      <div className='relative z-10 flex flex-col items-center justify-center flex-1 w-full'>
        {/* Assistant Info */}
        <div className='flex flex-col items-center justify-center mb-8 opacity-80 hover:opacity-100 transition-opacity'>
          <div className='w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/20 shadow-lg mb-3'>
            <img src={userData?.assistantImage} alt="Assistant" className='w-full h-full object-cover' />
          </div>
          <h2 className='text-white text-base font-medium tracking-wide'>I'm {userData?.assistantName}</h2>
        </div>

        {/* Visualizer */}
        <div className='h-32 w-full flex items-center justify-center mb-8'>
          {listening && isMicOn ? (
            <VoiceVisualizer isActive={true} />
          ) : null}
        </div>

        {/* Status Text */}
        <div className='mt-4 h-16 text-center px-4'>
          {userText && (
            <p className='text-blue-300 text-lg mb-2 animate-fade-in'>{userText}</p>
          )}
          {aiText && (
            <p className='text-gray-300 text-base animate-fade-in'>{aiText}</p>
          )}
          {!userText && !aiText && (
            <p className='text-gray-500 text-sm tracking-widest uppercase'>
              {isMicOn ? "Listening..." : "Tap Mic to Start"}
            </p>
          )}
        </div>
      </div>

      <div ref={chatEndRef} />

      {/* Chat Sidebar Overlay */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 shadow-2xl transition-transform duration-300 ease-in-out z-50 ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-700'>
            <h2 className='text-white text-xl font-semibold'>Chat</h2>
            <RxCross1 className='text-white w-[25px] h-[25px] cursor-pointer hover:text-gray-400 transition' onClick={() => setChatOpen(false)} />
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {userData && userData.history && userData.history.length > 0 ? (
              userData.history.map((msg, index) => (
                typeof msg === 'object' ? (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                      <p className='text-sm'>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="text-gray-500 text-xs text-center py-1">Legacy: {msg}</div>
                )
              ))
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p className='text-gray-500 text-center'>No messages yet.</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleInputSubmit} className='p-4 border-t border-gray-700'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Type your message...'
                className='flex-1 px-4 py-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500'
              />
              <button
                type='submit'
                className='px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium'
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className='absolute bottom-0 w-full p-6 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent flex flex-col items-center justify-center gap-4'>
        {/* Control Buttons */}
        <div className='flex items-center gap-4'>
          {/* Chat Button */}
          <button
            className='w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gray-700 text-gray-400 shadow-lg transition-all transform hover:scale-105 hover:bg-gray-600'
            onClick={() => setChatOpen(!chatOpen)}
          >
            <IoChatbubbleEllipses />
          </button>

          {/* Mic Button */}
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all transform hover:scale-105 ${isMicOn ? 'bg-blue-600 text-white shadow-blue-500/50' : 'bg-gray-700 text-gray-400'
              }`}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <IoMic /> : <IoMicOff />}
          </button>
        </div>
      </div>

    </div>
  )
}

export default Home