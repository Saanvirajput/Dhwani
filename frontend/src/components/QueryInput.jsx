import { useState } from 'react'

export default function QueryInput({ onSubmit, loading, language, onLanguageChange }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) onSubmit(query.trim())
  }

  const placeholder = 'अपना प्रश्न हिंदी में लिखें... (Type your question in Hindi)'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative">
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
          className="hindi w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
          disabled={loading}
        />
      </div>
      <div className="flex items-center justify-between">
        <div />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Thinking...' : 'पूछें / Ask'}
        </button>
      </div>
    </form>
  )
}
