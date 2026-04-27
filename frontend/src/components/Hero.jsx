import React from 'react'

export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-12 h-[400px] md:h-[500px] flex items-center">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-emerald-900/20" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 px-8 md:px-16 w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Next-Gen AI Assistant
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 leading-tight">
          Smarter access to <br />
          <span className="text-emerald-400">Welfare Schemes</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
          Navigate 2000+ government programs with Dhwani. Ask questions in natural Hindi and get instant, spoken guidance on eligibility and benefits.
        </p>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              ✓
            </div>
            <span className="text-sm font-medium text-slate-300">Sovereign Indic AI</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              ✓
            </div>
            <span className="text-sm font-medium text-slate-300">Voice-First Experience</span>
          </div>
        </div>
      </div>

      {/* Hero Illustration Placeholder - Pure CSS abstract art */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block w-96 h-96 animate-float">
        <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 backdrop-blur-xl rotate-6" />
            <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 backdrop-blur-xl -rotate-3" />
            <div className="absolute inset-4 bg-slate-900/80 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                    <div className="w-1/2 h-2 bg-slate-700 rounded" />
                    <div className="w-full h-2 bg-slate-800 rounded" />
                    <div className="w-3/4 h-2 bg-slate-800 rounded" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
                    <div className="flex-1 space-y-2">
                        <div className="w-full h-2 bg-indigo-500/20 rounded" />
                        <div className="w-1/2 h-2 bg-indigo-500/10 rounded" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
