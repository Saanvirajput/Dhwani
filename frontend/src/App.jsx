import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import QueryInput from './components/QueryInput.jsx'
import ResponsePanel from './components/ResponsePanel.jsx'
import SchemeCard from './components/SchemeCard.jsx'
import ModelBadge from './components/ModelBadge.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
      const demoResponse = language === 'hi' 
        ? "नमस्ते! मैं ध्वनि हूँ। वर्तमान में मेरा बैकएंड सर्वर ऑफलाइन है, लेकिन मैं आपको यह दिखा सकता हूँ कि मैं कैसे काम करता हूँ। मैं उत्तर प्रदेश की 'कन्या सुमंगला योजना' और 'वृद्धावस्था पेंशन योजना' जैसी 2000 से अधिक सरकारी योजनाओं में आपकी सहायता कर सकता हूँ।"
        : "నమస్కారం! నేను ధ్వనిని. ప్రస్తుతం నా బ్యాకెండ్ సర్వర్ ఆఫ్‌లైన్‌లో ఉంది, కానీ నేను ఎలా పని చేస్తానో మీకు చూపించగలను. నేను ఆంధ్రప్రదేశ్ మరియు తెలంగాణలోని 2000 పైగా ప్రభుత్వ పథకాలలో మీకు సహాయం చేయగలను."
      
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
              { name: language === 'hi' ? "कन्या सुमंगला योजना" : "కన్యా సుమంగళ పథకం", category: "Welfare", state: "UP" },
              { name: language === 'hi' ? "आयुष्मान भारत" : "ఆయుష్మాన్ భారత్", category: "Health", state: "National" }
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
    <div className="min-h-screen flex flex-col">
      <div className="tricolor-bar" />
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-bold text-white hindi tracking-tight">ध्वनि <span className="text-indigo-400 font-sans ml-2">Dhwani</span></h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">Intelligent Government Scheme Navigator</p>
        </div>
        <ModelBadge />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative">
            <QueryInput onSubmit={handleQuery} loading={loading} language={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>

        {!response && !loading && suggestions.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              {language === 'te' ? 'పథకం గురించి అడగండి:' : 'किसी योजना के बारे में पूछें:'}
            </p>
            <div className="relative mb-4">
              <input
                type="text"
                value={suggFilter}
                onChange={e => setSuggFilter(e.target.value)}
                placeholder={language === 'te' ? 'పథకం వెతకండి...' : 'योजना खोजें / Search schemes...'}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/30 divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
              {filtered.slice(0, 30).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleQuery(s.query)}
                  className="w-full text-left px-5 py-4 hover:bg-indigo-500/10 transition-all group border-l-2 border-transparent hover:border-indigo-500"
                >
                  <span className="hindi text-base text-slate-200 group-hover:text-white block">
                    {s.query}
                  </span>
                  <span className="block text-xs text-slate-500 mt-1.5 font-medium truncate uppercase tracking-wider">
                    {s.scheme_name}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-5 py-4 text-slate-500 text-sm italic">
                  {language === 'te' ? 'ఫలితాలు లేవు' : 'कोई परिणाम नहीं'}
                </div>
              )}
            </div>
          </div>
        )}

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
