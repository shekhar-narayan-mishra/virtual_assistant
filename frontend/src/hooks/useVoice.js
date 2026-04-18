import { useState, useEffect, useCallback, useRef } from 'react';

// Smart command processor
const processCommand = async (text, assistantName = 'Jarvis') => {
    const lower = text.toLowerCase().trim();

    // Time
    if (lower.includes('time') || lower.includes('what time') || lower.includes("what's the time")) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { response: `The current time is ${timeStr}.`, action: null };
    }

    // Date
    if (lower.includes('date') || lower.includes('what date') || lower.includes("today's date") || lower.includes('what day')) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return { response: `Today is ${dateStr}.`, action: null };
    }

    // Open YouTube
    if (lower.includes('open youtube') && !lower.includes('search')) {
        return { response: 'Opening YouTube for you.', action: () => window.open('https://www.youtube.com', '_blank') };
    }

    // Search YouTube
    if (lower.includes('search youtube') || lower.includes('youtube search') || lower.includes('search on youtube') || lower.includes('play on youtube') || lower.includes('find on youtube')) {
        const query = lower
            .replace(/search (on )?youtube (for )?/i, '')
            .replace(/youtube search (for )?/i, '')
            .replace(/play on youtube /i, '')
            .replace(/find on youtube /i, '')
            .trim();
        if (query) {
            return { response: `Searching YouTube for "${query}".`, action: () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank') };
        }
        return { response: 'What would you like me to search on YouTube?', action: null };
    }

    // Tell me about / Who is / What is (Wikipedia summary)
    const isInfoQuery = lower.startsWith('tell me about ') || lower.startsWith('who is ') || lower.startsWith('what is ');
    if (isInfoQuery && !/what is [\d+\-*/. ]+$/.test(lower)) {
        const query = lower
            .replace(/^tell me about /i, '')
            .replace(/^who is /i, '')
            .replace(/^what is /i, '')
            .trim();
        if (query) {
            try {
                const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/ /g, '_'))}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.type === 'standard' && data.extract) {
                        const sentences = data.extract.split('. ');
                        const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
                        return { response: summary, action: null }; 
                    }
                }
            } catch (e) {
                console.error('Wiki fetch error:', e);
            }
        }
    }

    // Open Google
    if (lower === 'open google') {
        return { response: 'Opening Google for you.', action: () => window.open('https://www.google.com', '_blank') };
    }

    // Search Google
    let googleQuery = null;
    if (lower.match(/search (.*?) on google/i)) {
        googleQuery = lower.match(/search (.*?) on google/i)[1];
    } else if (lower.startsWith('google search ')) {
        googleQuery = lower.replace(/^google search /i, '');
    } else if (lower.startsWith('google ')) {
        googleQuery = lower.replace(/^google /i, '');
    } else if (lower.startsWith('search ')) {
        googleQuery = lower.replace(/^search (for )?/i, '').replace(/ on google/i, '');
    } else if (lower.startsWith('look up ')) {
        googleQuery = lower.replace(/^look up /i, '');
    }

    if (googleQuery) {
        return { response: `Searching Google for "${googleQuery}".`, action: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`, '_blank') };
    }

    // Open any website
    if (lower.startsWith('open ')) {
        const site = lower.replace('open ', '').trim();
        if (site) {
            const url = site.includes('.') ? (site.startsWith('http') ? site : `https://${site}`) : `https://www.${site}.com`;
            return { response: `Opening ${site} for you.`, action: () => window.open(url, '_blank') };
        }
    }

    // Weather (joke response since no API)
    if (lower.includes('weather')) {
        return { response: "I don't have a weather API connected yet, but you can check weather on Google. Want me to search it for you?", action: null };
    }

    // Greeting
    if (['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'sup', 'yo'].some(g => lower.includes(g)) || lower === assistantName.toLowerCase()) {
        const greetings = [
            `Hello! I'm ${assistantName}. How can I help you today?`,
            `Hey there! What can I do for you?`,
            `Hi! I'm ${assistantName}, ready to assist you.`,
            `Greetings! How can I help?`,
        ];
        return { response: greetings[Math.floor(Math.random() * greetings.length)], action: null };
    }

    // How are you
    if (lower.includes('how are you') || lower.includes("how're you")) {
        return { response: "I'm running at full capacity! Thanks for asking. How can I help you?", action: null };
    }

    // Who are you / your name
    if (lower.includes('who are you') || lower.includes('your name') || lower.includes('what are you') || lower.includes(`are you ${assistantName.toLowerCase()}`)) {
        return { response: `I'm ${assistantName}, your AI voice assistant. I can tell you the time, search Google and YouTube, open websites, and more. Just ask!`, action: null };
    }

    // Thank you
    if (lower.includes('thank') || lower.includes('thanks')) {
        return { response: "You're welcome! Let me know if you need anything else.", action: null };
    }

    // Joke
    if (lower.includes('joke') || lower.includes('funny')) {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
            "What's a computer's favorite snack? Microchips!",
            "Why did the developer go broke? Because he used up all his cache.",
        ];
        return { response: jokes[Math.floor(Math.random() * jokes.length)], action: null };
    }

    // Calculator - basic math
    if (/[\d+\-*/^%]/.test(lower) && (lower.includes('calculate') || lower.includes('what is') || lower.includes('how much'))) {
        try {
            const mathExpr = lower.replace(/calculate|what is|how much is|equals/gi, '').trim();
            // Simple and safe eval for basic math
            const sanitized = mathExpr.replace(/[^0-9+\-*/.() ]/g, '');
            if (sanitized) {
                const result = Function('"use strict"; return (' + sanitized + ')')();
                return { response: `The answer is ${result}.`, action: null };
            }
        } catch (e) {
            return { response: "I couldn't calculate that. Could you rephrase?", action: null };
        }
    }

    // Fallback — still a helpful response
    return { response: `Let me search that for you.`, action: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank') };
};

export const useVoice = (assistantName = 'Jarvis') => {
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [history, setHistory] = useState([]);
    const [lastError, setLastError] = useState(null);
    const [isManualMode, setIsManualMode] = useState(false);

    const recognitionRef = useRef(null);
    const isIntentionalStop = useRef(false);

    const browserSupportsSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || listening) return;
        setTranscript("");
        isIntentionalStop.current = false;
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Mic start error:", e);
        }
    }, [listening]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        isIntentionalStop.current = true;
        recognitionRef.current.stop();
        setListening(false);
    }, []);

    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        setIsAiSpeaking(true);
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsAiSpeaking(false);
            if (!isIntentionalStop.current) {
                startListening();
            }
        };
        utterance.onerror = () => setIsAiSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [startListening]);

    const processInput = useCallback(async (text) => {
        if (!text) return;

        setIsProcessing(true);
        setHistory(prev => [...prev, { type: 'user', text }]);

        // Process the command
        const { response, action } = await processCommand(text, assistantName);

        // Small delay to feel natural
        setTimeout(() => {
            setHistory(prev => [...prev, { type: 'assistant', text: response }]);
            setIsProcessing(false);

            // Execute action (like opening a URL) if any
            if (action) action();

            speak(response);
        }, 600);
    }, [speak, assistantName]);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setListening(true);
        recognition.onend = () => {
            if (!isIntentionalStop.current) {
                // Auto-restart without toggling listening state (prevents flicker)
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error("Auto-restart error:", e);
                        setListening(false);
                    }
                }, 100);
            } else {
                setListening(false);
            }
        };

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            if (event.error === 'not-allowed') {
                setLastError("Microphone access denied");
                isIntentionalStop.current = true;
            }
        };

        recognitionRef.current = recognition;

        return () => {
            isIntentionalStop.current = true;
            recognition.stop();
        };
    }, []);

    // Wake word detection & processing
    useEffect(() => {
        if (!transcript || isProcessing || isAiSpeaking) return;

        const lowerTranscript = transcript.toLowerCase();
        const wakeWord = assistantName.toLowerCase();

        // After a small pause of silence (2s), process whatever was said.
        const timer = setTimeout(() => {
            let command = transcript.trim();
            
            // If they explicitly used the wake word, optionally trim it off
            if (lowerTranscript.includes(wakeWord)) {
                const parts = lowerTranscript.split(wakeWord);
                command = parts[parts.length - 1].trim();
                
                // If they just said "Jarvis" with no command
                if (command.length <= 2) {
                    speak("Yes? How can I help you?");
                    setTranscript("");
                    setIsManualMode(false);
                    return;
                }
            }
            
            if (command.length > 0) {
                processInput(command); // It processes it anyway!
            }
            
            setTranscript("");
            setIsManualMode(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [transcript, isProcessing, isAiSpeaking, assistantName, isManualMode, processInput, speak]);

    return {
        transcript,
        listening,
        isProcessing,
        history,
        lastError,
        isAiSpeaking,
        startListening: () => { setIsManualMode(true); startListening(); },
        stopListening,
        cancelSpeech: () => window.speechSynthesis.cancel(),
        clearHistory,
        browserSupportsSpeechRecognition
    };
};
