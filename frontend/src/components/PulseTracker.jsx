// frontend/src/components/PulseTracker.jsx
import React from 'react';
import { Flame, Zap, BarChart2 } from 'lucide-react';

export default function PulseTracker({ winProbability, momentum, hypeLevel, battingTeam, bowlingTeam }) {
  const rcbProb = winProbability?.batting ?? 50;
  const cskProb = winProbability?.bowling ?? 50;

  const batAbbr = battingTeam ? battingTeam.toUpperCase() : 'RCB';
  const bowlAbbr = bowlingTeam ? bowlingTeam.toUpperCase() : 'CSK';

  // Hype index colors based on intensity
  const getHypeColorClass = (val) => {
    if (val > 85) return 'from-rose-500 to-amber-500 shadow-rose-500/25';
    if (val > 60) return 'from-amber-400 to-yellow-500 shadow-amber-500/25';
    return 'from-indigo-400 to-emerald-500 shadow-indigo-500/25';
  };

  // Convert momentum (-100 to +100) to percentage for center slider (0 to 100%)
  // -100 (CSK dominant) -> 0% (Left)
  // +100 (RCB dominant) -> 100% (Right)
  const momentumPercent = (((momentum ?? 0) + 100) / 200) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Win Probability */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300 font-outfit uppercase">Win Probability</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Live AI Model</span>
        </div>

        {/* Probability Split Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase">{batAbbr}</span>
              <strong className="text-2xl font-black text-red-500 font-outfit">{rcbProb}%</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">{bowlAbbr}</span>
              <strong className="text-2xl font-black text-amber-400 font-outfit">{cskProb}%</strong>
            </div>
          </div>

          <div className="w-full h-4 bg-slate-800/40 rounded-full border border-white/5 overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700 ease-out glow-rose"
              style={{ width: `${rcbProb}%` }}
            ></div>
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-600 transition-all duration-700 ease-out glow-amber"
              style={{ width: `${cskProb}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-slate-500 text-center italic">
            Win predictor recalculated ball-by-ball based on runs required, wickets, and batsman rizz index.
          </p>
        </div>
      </div>

      {/* 2. Match Momentum */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-semibold text-slate-300 font-outfit uppercase">Match Momentum</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Dynamic Flow</span>
        </div>

        <div className="space-y-4 py-2">
          {/* Slider Line */}
          <div className="relative w-full h-2 bg-slate-800 rounded-full border border-white/5">
            {/* Center Line Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600/40 z-0"></div>

            {/* Glowing Momentum Node */}
            <div 
              className={`absolute -top-2 w-6 h-6 rounded-full bg-radial flex items-center justify-center shadow-lg transition-all duration-700 ease-out ${
                momentum > 15 ? 'from-red-400 to-red-600 shadow-red-500/50' : 
                momentum < -15 ? 'from-amber-400 to-amber-600 shadow-amber-500/50' : 
                'from-slate-400 to-slate-600 shadow-slate-500/25'
              }`}
              style={{ left: `calc(${momentumPercent}% - 12px)` }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute opacity-45"></span>
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <span className={`transition-colors duration-500 ${momentum < -15 ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-500'}`}>
              {bowlAbbr} dominant
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {momentum === 0 ? "Balanced" : `${Math.abs(momentum)}% ${momentum > 0 ? batAbbr : bowlAbbr}`}
            </span>
            <span className={`transition-colors duration-500 ${momentum > 15 ? 'text-red-500 font-extrabold scale-105' : 'text-slate-500'}`}>
              {batAbbr} dominant
            </span>
          </div>

          <p className="text-[10px] text-slate-500 text-center italic">
            Measures consecutive boundaries, wickets, and run rate acceleration over the last 12 deliveries.
          </p>
        </div>
      </div>

      {/* 3. Crowd Pulse & Hype Index */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
            <span className="text-sm font-semibold text-slate-300 font-outfit uppercase">Crowd Pulse</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Stadium Decibels</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Decibel Hype Index</span>
            <span className="text-xl font-extrabold font-outfit text-white flex items-center gap-1">
              <span className="animate-pulse">🔥</span> {hypeLevel}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800/40 rounded-full border border-white/5 overflow-hidden p-0.5">
            <div 
              className={`h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out shadow-lg ${getHypeColorClass(hypeLevel)}`}
              style={{ width: `${hypeLevel}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase tracking-wider">
            <span>Chill</span>
            <span>Buzzing</span>
            <span>Pandemonium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
