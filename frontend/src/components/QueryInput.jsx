import { useState } from 'react'

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
        onSubmit(query.trim())
        setQuery('')
    }
  }

  const placeholder = 'अपना प्रश्न यहाँ लिखें... (e.g., बेटी बचाओ योजना के क्या लाभ हैं?)'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder={placeholder}
          rows={3}
          className="hindi w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xl transition-all shadow-inner group-hover:border-white/20"
          disabled={loading}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300 ${query.length > 0 ? 'opacity-40' : 'opacity-0'}`}>
                {query.length} chars
            </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Hindi Input
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Voice Ready
            </div>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="relative overflow-hidden group px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold tracking-wide transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <div className="relative z-10 flex items-center gap-2">
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    अडगंडी / Ask Dhwani
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </form>
  )
}
