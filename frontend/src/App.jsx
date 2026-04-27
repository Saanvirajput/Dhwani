import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import QueryInput from './components/QueryInput.jsx'
import ResponsePanel from './components/ResponsePanel.jsx'
import SchemeCard from './components/SchemeCard.jsx'
import ModelBadge from './components/ModelBadge.jsx'
import Hero from './components/Hero.jsx'
import CategoryGrid from './components/CategoryGrid.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dhwani-backend-saanvi.loca.lt'

export default function App() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('hi')
  const [suggestions, setSuggestions] = useState([])
  const [suggFilter, setSuggFilter] = useState('')

  // Fetch suggestions on mount and language change
  useEffect(() => {
    fetch(`${API_BASE_URL}/schemes/suggestions?count=50&language=${language}`)
      .then(r => r.json())
      .then(data => setSuggestions(data.suggestions || []))
      .catch(() => {})
  }, [language])

  function handleLanguageChange(lang) {
    setLanguage(lang)
    setResponse(null)
    setError(null)
    setSuggFilter('')
  }

  async function handleQuery(query) {
    setLoading(true)
    setError(null)
    setSuggFilter('')
    setResponse({
      text: '', schemes: [], latency_ms: null, query,
      streaming: true, audio: null, audioChunks: [],
      narrateState: 'auto',
    })

    try {
      // Unlock browser autoplay (user gesture context from Submit click)
      const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
      silent.play().catch(() => {})

      const res = await fetch(`${API_BASE_URL}/ask/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          const event = JSON.parse(raw)

          if (event.type === 'token') {
            flushSync(() => {
              setResponse(prev => ({ ...prev, text: prev.text + event.text }))
            })
          } else if (event.type === 'audio') {
            // Progressive audio — each sentence arrives as it's synthesized
            const blob = new Blob([Uint8Array.from(atob(event.audio_base64), c => c.charCodeAt(0))], { type: 'audio/mp3' })
            const url = URL.createObjectURL(blob)
            setResponse(prev => {
              const chunks = [...(prev.audioChunks || [])]
              chunks[event.index] = event.audio_base64
              return {
                ...prev,
                audio: prev.audio || event.audio_base64,
                audioChunks: chunks.filter(Boolean),
                narrateState: 'ready',
              }
            })
          } else if (event.type === 'done') {
            setResponse(prev => ({
              ...prev,
              schemes: event.schemes,
              latency_ms: event.latency_ms,
              streaming: false,
              narrateState: prev.audioChunks?.length ? 'ready' : prev.narrateState,
            }))
            setLoading(false)
          } else if (event.type === 'error') {
            if (event.scope === 'llm') {
              setError(event.detail)
              setLoading(false)
            } else {
              console.warn('TTS error for sentence', event.sentence_index, event.detail)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Backend offline, entering Demo Mode...')
      // PREMIUM PORTFOLIO FALLBACK: Provide a high-quality demo response
      const demoResponse = "नमस्ते! मैं ध्वनि हूँ। वर्तमान में मेरा बैकएंड सर्वर ऑफलाइन है, लेकिन मैं आपको यह दिखा सकता हूँ कि मैं कैसे काम करता हूँ। मैं उत्तर प्रदेश की 'कन्या सुमंगला योजना' और 'वृद्धावस्था पेंशन योजना' जैसी 2000 से अधिक सरकारी योजनाओं में आपकी सहायता कर सकता हूँ।"
      
      let currentText = ""
      const tokens = demoResponse.split(" ")
      for (let i = 0; i < tokens.length; i++) {
        await new Promise(r => setTimeout(r, 60)) // Simulate streaming
        currentText += tokens[i] + " "
        flushSync(() => {
          setResponse(prev => ({
            ...prev,
            text: currentText,
            streaming: i < tokens.length - 1,
            schemes: [
              { name: "कन्या सुमंगला योजना", category: "Welfare", state: "UP" },
              { name: "आयुष्मान भारत", category: "Health", state: "National" }
            ],
            narrateState: 'idle'
          }))
        })
      }
      setLoading(false)
    }
  }

  async function handleNarrate(text) {
    setResponse(prev => ({ ...prev, narrateState: 'loading', audio: null, audioChunks: [] }))
    try {
      const res = await fetch(`${API_BASE_URL}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })
      if (!res.ok) throw new Error(`Narrate error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          const event = JSON.parse(raw)
          if (event.type === 'chunk') {
            setResponse(prev => {
              const chunks = [...(prev.audioChunks || []), event.audio_base64]
              return {
                ...prev,
                narrateState: 'ready',
                audio: prev.audio || event.audio_base64,
                audioChunks: chunks,
              }
            })
          } else if (event.type === 'error') {
            setResponse(prev => ({ ...prev, narrateState: 'error' }))
          }
        }
      }
    } catch (e) {
      setResponse(prev => ({ ...prev, narrateState: 'error' }))
    }
  }

  // Filter suggestions by search text
  const filtered = suggFilter.trim()
    ? suggestions.filter(s =>
        s.scheme_name.toLowerCase().includes(suggFilter.toLowerCase()) ||
        s.query.toLowerCase().includes(suggFilter.toLowerCase())
      )
    : suggestions

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <header className="bg-slate-950/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            D
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white hindi tracking-tight leading-none">ध्वनि <span className="text-indigo-400 font-outfit ml-1 text-xl font-medium tracking-normal">Dhwani</span></h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold">Sovereign AI Navigator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModelBadge />
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-all">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Systems
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col">
        {!response && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Hero />
            <CategoryGrid onSelect={(cat) => setSuggFilter(cat)} />
          </div>
        )}

        <div className={`transition-all duration-700 ease-in-out ${response || loading ? 'max-w-4xl mx-auto w-full' : 'w-full'}`}>
          <div className="relative group mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
            <div className="relative">
              <QueryInput onSubmit={handleQuery} loading={loading} language={language} onLanguageChange={handleLanguageChange} />
            </div>
          </div>

          {!response && !loading && suggestions.length > 0 && (
            <div className="glass-card rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-200 font-semibold flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                  Trending Inquiries
                </p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  Live Feed
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                  🔍
                </div>
                <input
                  type="text"
                  value={suggFilter}
                  onChange={e => setSuggFilter(e.target.value)}
                  placeholder="Filter schemes or questions..."
                  className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all hover:bg-slate-900/60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {filtered.slice(0, 30).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuery(s.query)}
                    className="flex flex-col text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all group"
                  >
                    <span className="hindi text-slate-200 group-hover:text-white transition-colors">
                      {s.query}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider group-hover:text-slate-400">
                      {s.scheme_name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {response && (
          <div className="flex flex-col gap-6">
            <ResponsePanel
              key={response.query}
              text={response.text}
              audio={response.audio}
              audioChunks={response.audioChunks}
              narrateState={response.narrateState}
              latencyMs={response.latency_ms}
              query={response.query}
              streaming={response.streaming}
              onNarrate={() => handleNarrate(response.text)}
            />
            {!response.streaming && response.schemes?.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-slate-500 text-xs uppercase tracking-widest">
                  Retrieved Schemes
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {response.schemes.map((s, i) => (
                    <SchemeCard key={i} scheme={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
