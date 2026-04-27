import React from 'react'

const categories = [
  { id: 'agri', name: 'Agriculture', hindi: 'कृषि एवं ग्रामीण', icon: '🌾', count: 835, color: 'emerald' },
  { id: 'edu', name: 'Education', hindi: 'शिक्षा एवं शिक्षण', icon: '🎓', count: 1084, color: 'indigo' },
  { id: 'health', name: 'Health', hindi: 'स्वास्थ्य एवं कल्याण', icon: '⚕️', count: 287, color: 'rose' },
  { id: 'business', name: 'Business', hindi: 'व्यापार एवं उद्यम', icon: '🤝', count: 748, color: 'amber' },
  { id: 'social', name: 'Social Welfare', hindi: 'सामाजिक कल्याण', icon: '✊', count: 1437, color: 'blue' },
  { id: 'women', name: 'Women & Child', hindi: 'महिला एवं बाल', icon: '👩‍👧', count: 465, color: 'pink' },
]

export default function CategoryGrid({ onSelect }) {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold font-outfit">Find schemes by category</h2>
          <p className="text-slate-500 text-sm mt-1">Explore programs tailored to your specific needs</p>
        </div>
        <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors uppercase tracking-wider">
          View all 2000+
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-load">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="glass-card p-6 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-2xl category-icon-bg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              {cat.icon}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-1">{cat.count} Schemes</p>
            <h3 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors">{cat.name}</h3>
            <p className="hindi text-slate-500 text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{cat.hindi}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
