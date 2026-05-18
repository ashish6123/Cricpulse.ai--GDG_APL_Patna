// frontend/src/components/RivalryRooms.jsx
import React, { useState } from 'react';
import { Users, Award, ShieldAlert, Sparkles, Flame, Copy, Check, Tv, Heart } from 'lucide-react';

export default function RivalryRooms({ socket, matchState, userProfile }) {
  const [activeTab, setActiveTab] = useState('lobby');
  const [copied, setCopied] = useState(false);
  const [predictions, setPredictions] = useState({
    winner: '',
    wicketMethod: '',
    overRuns: '',
    topScorer: '',
    turningPoint: ''
  });
  const [lockedPredictions, setLockedPredictions] = useState({});

  if (!matchState) return null;

  const handleCopyLink = () => {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    navigator.clipboard.writeText(`${appUrl}/?room=CP-CHINNASWAMY-2026`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlacePrediction = (field, value) => {
    setPredictions(prev => ({ ...prev, [field]: value }));
    setLockedPredictions(prev => ({ ...prev, [field]: value }));

    // Synthesize procedural audio trigger
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  };

  const friends = [
    { name: 'GladiatorKing', team: 'RCB', active: true, streak: 3, accuracy: '84%' },
    { name: 'ThalaFinisher', team: 'CSK', active: true, streak: 5, accuracy: '90%' },
    { name: 'RizzlerStriker', team: 'RCB', active: true, streak: 1, accuracy: '62%' },
    { name: 'SwordJaddu', team: 'CSK', active: false, streak: 0, accuracy: '75%' }
  ];

  // Playful dynamic AI roasts based on friend selections
  const banterLogs = [
    { author: '🤡 Pop Culture Meme', text: "ThalaFinisher locked in another CSK win. AI suggests ordering industrial-grade coping tissues immediately." },
    { author: '🧠 Tactical Strategist', text: "GladiatorKing predicted a caught wicket off Pathirana. Radar tracking shows slinging trajectory makes bowling or LBW 42% more probable. Poor judgment logged." },
    { author: '🎙️ Hype & Emotion', text: "RizzlerStriker expects a 100m towering six next over! Stadium noise indexes are already vibrating. IT'S A BOLD PLAY!" },
    { author: '📊 Crowd Pulse', text: "Rivalry room tension spiked to 92%. Banter channels are operating in high-severity roast mode." }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 glow-indigo relative overflow-hidden flex flex-col justify-between min-h-[460px]">
      {/* Background neon orb */}
      <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-extrabold font-outfit text-slate-200 uppercase tracking-wide">Rivalry Arena & Friend Battles</h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Room Code: CP-CHINNASWAMY-2026</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-slate-900/60 border border-white/5 p-1 rounded-xl text-[10px] font-bold font-outfit">
          <button 
            onClick={() => setActiveTab('lobby')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'lobby' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Lobby & Invite
          </button>
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'predictions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Battle Deck
          </button>
          <button 
            onClick={() => setActiveTab('banter')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'banter' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Banter Feed
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-grow space-y-4">
        
        {/* TAB 1: LOBBY & INVITE */}
        {activeTab === 'lobby' && (
          <div className="space-y-4">
            {/* Invite Panel */}
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-inner">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[8px] font-black font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">Invites open</span>
                <h4 className="text-xs font-bold text-slate-200">Assemble Your Cricket Syndicate</h4>
                <p className="text-[10px] text-slate-500">Invite up to 10 friends to share this live screen and wage prediction battles.</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Invite Copied!' : 'Copy Room Invite'}
              </button>
            </div>

            {/* Friend List Standings */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Syndicate Battle Board</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((friend, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/40 border border-white/5 rounded-2xl flex justify-between items-center hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 border ${
                          friend.team === 'RCB' ? 'border-red-500/30' : 'border-amber-400/30'
                        }`}>
                          {friend.name.substring(0,2).toUpperCase()}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                          friend.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                        }`}></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 leading-none">{friend.name}</span>
                          <span className={`text-[7px] font-black px-1.5 py-0.2 rounded font-mono uppercase ${
                            friend.team === 'RCB' ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-400'
                          }`}>{friend.team}</span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono">Accuracy: {friend.accuracy}</span>
                      </div>
                    </div>
                    {friend.streak > 0 && (
                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono flex items-center gap-0.5 animate-pulse">
                        <Flame className="w-3.5 h-3.5 fill-current" /> {friend.streak} Streak
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BATTLE DECK PREDICTIONS */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <div className="bg-indigo-500/5 border border-indigo-500/15 p-3 rounded-2xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Wager on match-turning points, bowlers, and scores. Correct selections reward high multiplier multipliers and extend your syndicate win streaks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Predict Next Wicket Method */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">☄️ Next Wicket Method (8.0x)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Caught', 'Bowled', 'LBW', 'Run Out'].map(method => {
                    const isLocked = lockedPredictions.wicketMethod === method;
                    return (
                      <button
                        key={method}
                        onClick={() => handlePlacePrediction('wicketMethod', method)}
                        disabled={!!lockedPredictions.wicketMethod}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                          isLocked 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-indigo-500/20 hover:text-slate-200'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Predict Next Over Runs */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">🏏 Next Over Runs (3.5x)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Under 6', '6-10', '11-15', 'Over 15'].map(range => {
                    const isLocked = lockedPredictions.overRuns === range;
                    return (
                      <button
                        key={range}
                        onClick={() => handlePlacePrediction('overRuns', range)}
                        disabled={!!lockedPredictions.overRuns}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                          isLocked 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-indigo-500/20 hover:text-slate-200'
                        }`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Predict Top Scorer */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">👑 Match Top Scorer (5.0x)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {['V. Kohli', 'R. Gaikwad', 'M.S. Dhoni'].map(player => {
                    const isLocked = lockedPredictions.topScorer === player;
                    return (
                      <button
                        key={player}
                        onClick={() => handlePlacePrediction('topScorer', player)}
                        disabled={!!lockedPredictions.topScorer}
                        className={`py-2 text-[9px] font-bold rounded-xl border transition-all truncate ${
                          isLocked 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-indigo-500/20 hover:text-slate-200'
                        }`}
                      >
                        {player}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Predict Turning Point */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">🌟 Key Match Turning Point (10.0x)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Dropped Catch', 'Unplayable Yorker', '100m Six', 'Direct Hit'].map(point => {
                    const isLocked = lockedPredictions.turningPoint === point;
                    return (
                      <button
                        key={point}
                        onClick={() => handlePlacePrediction('turningPoint', point)}
                        disabled={!!lockedPredictions.turningPoint}
                        className={`py-2 text-[9px] font-bold rounded-xl border transition-all truncate ${
                          isLocked 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-indigo-500/20 hover:text-slate-200'
                        }`}
                      >
                        {point}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: AI BANTER ROAST FEED */}
        {activeTab === 'banter' && (
          <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
            {banterLogs.map((log, idx) => (
              <div 
                key={idx} 
                className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl flex flex-col gap-1 relative overflow-hidden"
              >
                {/* Visual strip indicator */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-500/35"></div>
                
                <span className={`text-[8px] font-mono tracking-widest uppercase font-black ${
                  log.author.includes('Meme') ? 'text-purple-400' :
                  log.author.includes('Tactical') ? 'text-indigo-400' :
                  log.author.includes('Hype') ? 'text-rose-400' :
                  'text-emerald-400'
                }`}>{log.author}</span>
                
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed pl-1">{log.text}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[8px] text-slate-500 border-t border-white/5 pt-3 uppercase font-mono tracking-wider mt-4">
        <span>Rivalry multipliers computed live</span>
        <span className="flex items-center gap-1 text-indigo-400/80">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Syndicate synced
        </span>
      </div>

    </div>
  );
}
