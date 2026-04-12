import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import axios from 'axios'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import authImage from '../assets/image.png'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const { ServerUrl, setUser } = useContext(UserDataContext)
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLoginSuccess = (data) => {
    const { token, _id, name: userName, email: userEmail } = data
    localStorage.setItem("token", token)
    localStorage.setItem("userId", _id)
    localStorage.setItem("userName", userName)
    setUser({ _id, name: userName, email: userEmail, token })
    navigate("/customize")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await axios.post(`${ServerUrl}/api/auth/signup`, {
        name, email, password
      })
      if (res.status === 201) {
        handleLoginSuccess(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    setLoading(true)
    try {
      const res = await axios.post(`${ServerUrl}/api/auth/google-login`, {
        token: credentialResponse.credential
      })
      if (res.status === 200) {
        handleLoginSuccess(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google sign up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // GitHub OAuth
  const handleGithubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError("GitHub OAuth is not configured. Please set VITE_GITHUB_CLIENT_ID in .env")
      return
    }
    const redirectUri = window.location.origin + "/signup"
    const scope = "read:user user:email"
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    window.location.href = githubAuthUrl
  }

  // Handle GitHub OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname)
      setLoading(true)
      axios.post(`${ServerUrl}/api/auth/github-login`, { code })
        .then(res => {
          if (res.status === 200) {
            handleLoginSuccess(res.data)
          }
        })
        .catch(err => {
          setError(err.response?.data?.message || "GitHub sign up failed. Please try again.")
        })
        .finally(() => setLoading(false))
    }
  }, [])

  const signupContent = (
    <div className="relative w-full min-h-screen bg-[#030305] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Hero Background Elements */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1000px] min-h-[650px] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(139,92,246,0.15)] border border-white/5"
        style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)' }}
      >
        {/* Left Panel - Hero Image */}
        <div className="relative w-full md:w-[45%] min-h-[250px] md:min-h-full overflow-hidden">
          <img src={authImage} alt="AI Virtual Assistant" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 40%, transparent 70%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }} />



          <div className="absolute bottom-28 left-6 flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="absolute bottom-8 left-8 right-8">
            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Create Your<br />
              <span style={{ background: 'linear-gradient(90deg, #a78bfa, #c084fc, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vision</span>
            </h2>
            <p className="text-sm md:text-base leading-relaxed max-w-[300px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              AI-assisted workspace to craft and elevate your ideas. Join us today.
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-[55%] flex flex-col items-center justify-center px-6 sm:px-10 md:px-14 py-10 md:py-8 bg-[#0f0f1a]">
          {/* Tab Switcher */}
          <div className="mb-10 flex gap-8 border-b border-white/10 w-full max-w-[420px]">
            <button className="pb-3 text-sm font-medium text-white border-b-2 border-violet-500 bg-transparent cursor-default">
              Sign Up
            </button>
            <button onClick={() => navigate("/signin")} className="pb-3 text-sm font-medium text-white/40 hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer">
              Log In
            </button>
          </div>

          {/* Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mb-10 w-full max-w-[420px]">
            <h1 className="text-white text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Create An Account</h1>
            <p className="text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Join us and start building today</p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[380px] mb-5 px-4 py-3 rounded-xl text-sm text-center font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </motion.div>
          )}

          {/* Form */}
          <motion.form initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onSubmit={handleSubmit} className="w-full max-w-[420px] flex flex-col gap-6">
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                <User className="w-4 h-4 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full h-13 pr-4 rounded-xl text-sm text-white outline-none transition-all duration-300 bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-violet-500/50"
                style={{ paddingLeft: '55px', fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                <Mail className="w-4 h-4 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full h-13 pr-4 rounded-xl text-sm text-white outline-none transition-all duration-300 bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-violet-500/50"
                style={{ paddingLeft: '55px', fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                <Lock className="w-4 h-4 transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full h-13 pr-12 rounded-xl text-sm text-white outline-none transition-all duration-300 bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-violet-500/50"
                style={{ paddingLeft: '55px', fontFamily: 'Outfit, sans-serif' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-13 rounded-xl text-base font-semibold text-white cursor-pointer transition-all duration-300 active:scale-[0.98] disabled:opacity-50 overflow-hidden relative group"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea, #c026d3)', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)', border: 'none', fontFamily: 'Outfit, sans-serif' }}>
              <span className="relative z-10">{loading ? "Creating Account..." : "Create an Account"}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>Or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* OAuth Buttons */}
            <div className="flex gap-4">
              {/* Google OAuth - Better Styled Container */}
              <div className="flex-1 h-12 rounded-xl overflow-hidden flex items-center justify-center relative cursor-pointer group transition-all duration-300 hover:bg-white/[0.08]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="absolute inset-0 z-0 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-medium text-white/80">Google</span>
                </div>
                {/* Invisible actual button for functionality */}
                <div className="opacity-0 scale-[2.5] absolute inset-0 cursor-pointer">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign up failed")}
                    useOneTap
                  />
                </div>
              </div>

              {/* GitHub OAuth */}
              <button type="button" onClick={handleGithubLogin}
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-medium cursor-pointer transition-all duration-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20">
                <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>

            <button type="button" onClick={() => navigate("/customize")}
              className="w-full h-12 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white/50 hover:text-white/80"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              Continue as Guest
            </button>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
            Already have an account?{' '}
            <span className="cursor-pointer font-semibold" style={{ color: '#a78bfa' }} onClick={() => navigate("/signin")}
              onMouseEnter={(e) => e.target.style.color = '#c4b5fd'} onMouseLeave={(e) => e.target.style.color = '#a78bfa'}>
              Sign In
            </span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {signupContent}
    </GoogleOAuthProvider>
  )
}

export default Signup