// frontend/src/components/CommentaryFeed.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronRight, RefreshCw, Radio, Play, Square, Headphones } from 'lucide-react';

export default function CommentaryFeed({ history, currentCommentaries, isLoading }) {
  const [activePersonality, setActivePersonality] = useState('hype');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const previousBallRef = useRef(null);

  const personalities = [
    { id: 'hype', label: 'Hype Caster', icon: '🎙️', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'tactical', label: 'Tactical Analyst', icon: '🧠', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'meme', label: 'Meme Lord', icon: '🤡', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'genz', label: 'Gen Z Creator', icon: '💅', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
    { id: 'cinematic', label: 'Cinematic Narrator', icon: '🎬', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
  ];

  const getOutcomeBadge = (runs, wicket) => {
    if (wicket) return 'bg-rose-500 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider';
    if (runs === 6) return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider';
    if (runs === 4) return 'bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider';
    if (runs === 0) return 'bg-slate-700 text-slate-400 font-medium px-2 py-0.5 rounded text-[10px] uppercase';
    return 'bg-emerald-600 text-white font-medium px-2 py-0.5 rounded text-[10px] uppercase';
  };

  const getActiveCommentaryText = () => {
    if (isLoading) return "Analyzing the ball dynamics, running neural engines...";
    if (!currentCommentaries) return "Welcome to CricPulse AI! The match is initializing. Waiting for the first ball...";
    return currentCommentaries[activePersonality] || currentCommentaries['hype'];
  };

  const getPersonaColorBorder = (id) => {
    switch (id) {
      case 'hype': return 'border-rose-500/40 shadow-rose-500/5';
      case 'tactical': return 'border-indigo-500/40 shadow-indigo-500/5';
      case 'meme': return 'border-amber-500/40 shadow-amber-500/5';
      case 'genz': return 'border-pink-500/40 shadow-pink-500/5';
      case 'cinematic': return 'border-purple-500/40 shadow-purple-500/5';
      default: return 'border-white/10';
    }
  };

  // Text-To-Speech function driven by selected personality coefficients
  const handleSpeak = (text) => {
    if (!text || text.includes("Analyzing") || text.includes("Welcome")) return;
    
    // Cancel active synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Dynamically adjust vocal traits based on persona
    switch (activePersonality) {
      case 'hype':
        utterance.rate = 1.25;
        utterance.pitch = 1.15;
        break;
      case 'tactical':
        utterance.rate = 0.95;
        utterance.pitch = 0.85;
        break;
      case 'meme':
        utterance.rate = 1.12;
        utterance.pitch = 1.0;
        break;
      case 'genz':
        utterance.rate = 1.22;
        utterance.pitch = 1.12;
        break;
      case 'cinematic':
        utterance.rate = 0.82;
        utterance.pitch = 0.72;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Trigger speak when text changes or when autoSpeak is active
  useEffect(() => {
    const text = getActiveCommentaryText();
    if (autoSpeak && currentCommentaries) {
      // Avoid speaking initial welcomes or loading texts
      if (!text.includes("Analyzing") && !text.includes("Welcome")) {
        // Trigger only when a new delivery unique identifier (e.g. history length or first ball) shifts
        if (history.length > 0 && previousBallRef.current !== history[0]?.over) {
          previousBallRef.current = history[0]?.over;
          handleSpeak(text);
        }
      }
    }
  }, [currentCommentaries, activePersonality, autoSpeak, history]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 glow-indigo flex flex-col gap-5 relative overflow-hidden">
      
      {/* Header with Personality Tabs */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-base font-bold font-outfit text-slate-200">Alternate Commentary Engine</h3>
          </div>
          
          {/* Controls Panel */}
          <div className="flex items-center gap-3">
            {/* Auto speak toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white relative"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Auto-Broadcast</span>
            </label>
          </div>
        </div>

        {/* Personality Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {personalities.map((p) => {
            const isActive = activePersonality === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersonality(p.id);
                  if (isSpeaking) {
                    // Instantly speak new commentary when personality changes
                    setTimeout(() => {
                      const text = currentCommentaries?.[p.id] || currentCommentaries?.[activePersonality];
                      handleSpeak(text);
                    }, 50);
                  }
                }}
                className={`py-2 px-1 text-center rounded-xl border text-[10px] sm:text-xs font-bold font-outfit transition-all flex items-center justify-center gap-1.5 ${
                  isActive 
                    ? p.color + ' ring-1 ring-white/10 scale-95 font-bold shadow-md' 
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>{p.icon}</span>
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Ball Commentary Showcase */}
      <div className={`p-5 rounded-2xl border bg-slate-950/40 relative overflow-hidden transition-all duration-500 flex flex-col justify-between gap-4 ${getActiveCommentaryText() ? 'glow-indigo border-indigo-500/20' : 'border-white/5'} ${getPersonaColorBorder(activePersonality)}`}>
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Avatar indicator */}
        <div className="flex justify-between items-center w-full relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-base shadow">
              {personalities.find(p => p.id === activePersonality)?.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 font-outfit leading-none">
                {personalities.find(p => p.id === activePersonality)?.label} Commentary
              </h4>
              <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest mt-1">Realtime Synthesizer Active</p>
            </div>
          </div>
          
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
        </div>

        {/* Text Area */}
        <div className="relative z-10">
          <p className={`text-sm sm:text-base leading-relaxed text-slate-200 ${
            activePersonality === 'hype' ? 'font-extrabold font-outfit uppercase tracking-tight' : 'font-medium'
          }`}>
            {getActiveCommentaryText()}
          </p>
        </div>

        {/* TTS Trigger & Equalizer Bar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3.5 relative z-10">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Web Speech API</span>

          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all text-[10px] font-bold uppercase tracking-wider font-mono animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Broadcasting Live</span>
              {/* Equalizer animation */}
              <div className="flex gap-0.5 items-end h-2.5 px-0.5">
                <span className="w-0.5 bg-rose-400 rounded-full h-full animate-[bounce_0.6s_infinite_alternate]"></span>
                <span className="w-0.5 bg-rose-400 rounded-full h-1/2 animate-[bounce_0.8s_infinite_alternate_0.1s]"></span>
                <span className="w-0.5 bg-rose-400 rounded-full h-2/3 animate-[bounce_0.5s_infinite_alternate_0.2s]"></span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => handleSpeak(getActiveCommentaryText())}
              disabled={isLoading || !currentCommentaries}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[10px] font-bold uppercase tracking-wider font-mono"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🔊 Listen Live Broadcast</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline of Past Balls */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-outfit">Ball-by-Ball Timeline</h4>
        
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            Waiting for the match simulation to begin...
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {history.map((item, idx) => {
              const storedCommentary = item.commentaries?.[activePersonality] || item.commentarySeed;

              return (
                <div key={idx} className="flex gap-4 items-start p-3 bg-slate-950/40 border border-white/5 rounded-2xl hover:bg-slate-900/20 transition-all">
                  
                  {/* Left: Ball Info */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/25">
                      {item.over}
                    </span>
                    <span className={getOutcomeBadge(item.runs, item.wicket)}>
                      {item.wicket ? 'OUT' : `${item.runs} R`}
                    </span>
                  </div>

                  {/* Right: Text Details */}
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-outfit truncate">
                        {item.batsman} vs {item.bowler}
                      </span>
                      {item.wicket && (
                        <span className="text-[8px] text-rose-400 font-bold font-mono truncate uppercase tracking-widest">
                          ({item.wicket.type})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {storedCommentary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
