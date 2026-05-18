// frontend/src/components/PredictorArena.jsx
import React, { useState, useEffect } from 'react';
import { Award, Zap, AlertCircle, HelpCircle, Check, Timer, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function PredictorArena({
  socket,
  joinedGame,
  userProfile,
  leaderboard,
  countdown,
  matchState,
  onFactionSelect // Callback to inform App.jsx of active faction
}) {
  const [username, setUsername] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('RCB');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [wager, setWager] = useState(100);
  const [predictionPlaced, setPredictionPlaced] = useState(false);
  const [lockedPrediction, setLockedPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiHint, setAiHint] = useState('');

  // AI strategic hint generator based on batsman/bowler
  useEffect(() => {
    if (matchState) {
      const { currentBatsman, currentBowler } = matchState;
      if (currentBatsman === 'Virat Kohli') {
        if (currentBowler === 'Matheesha Pathirana') {
          setAiHint("Pathirana has been firing slinging yorkers at 150 km/h. Kohli historically scores at 145+ Strike Rate against his deliveries at Chinnaswamy but watch for late dip. Tip: Boundary or Dot Ball.");
        } else if (currentBowler === 'Ravindra Jadeja') {
          setAiHint("Jadeja is bowling flat arm-balls on the stumps. Kohli has a 78% boundary drive rate when opening his stance, but Jadeja's spin keeps him low. Tip: 1-3 Runs or Boundary.");
        } else {
          setAiHint("Shardul Thakur is dropping the length back with cutters. Kohli is looking to charge or steer behind square. Tip: 1-3 Runs.");
        }
      } else if (currentBatsman === 'Glenn Maxwell') {
        setAiHint("Maxwell is looking to clear his front leg and reverse sweep immediately. High volatility, high reward. Tip: Boundary 4/6 or Wicket.");
      } else if (currentBatsman === 'Dinesh Karthik') {
        setAiHint("Karthik loves the scoop shot over fine leg against pace, but bowlers are targetting the wide blockhole. Tip: 1-3 Runs or Boundary.");
      } else {
        setAiHint("RCB tail-ender on strike! CSK bowlers will target the stumps with searing yorkers. Massive wicket pressure. Tip: Wicket or Dot.");
      }
    }
  }, [matchState]);

  // Reset prediction when countdown restarts
  useEffect(() => {
    if (countdown === 10) {
      setPredictionPlaced(false);
      setLockedPrediction(null);
      setSelectedChoice('');
      setErrorMessage('');
    }
  }, [countdown]);

  // Handle joining game
  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Emit connection event
    socket.emit('join-game', {
      username: username.trim(),
      team: favoriteTeam
    });

    if (onFactionSelect) {
      onFactionSelect(favoriteTeam);
    }
  };

  // Handle placing prediction
  const handlePredict = (choice) => {
    if (!joinedGame) return;
    if (countdown <= 0) {
      setErrorMessage("Predictions are closed for this ball!");
      return;
    }
    if (wager > userProfile.points) {
      setErrorMessage("Insufficient token balance!");
      return;
    }

    setSelectedChoice(choice);
    socket.emit('place-prediction', {
      choice,
      pointsBet: wager
    });

    setPredictionPlaced(true);
    setLockedPrediction({ choice, wager });
    setErrorMessage('');
  };

  // Prediction options configuration
  const predictionOptions = [
    { 
      id: 'dot', 
      label: '🛡️ Dot Ball', 
      multiplier: '1.5x', 
      desc: 'No runs scored', 
      color: 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-900/60' 
    },
    { 
      id: 'single', 
      label: '🏃‍♂️ 1-3 Runs', 
      multiplier: '2.0x', 
      desc: 'Singles, doubles & run speed', 
      color: 'border-emerald-950 bg-emerald-950/20 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/40' 
    },
    { 
      id: 'boundary', 
      label: '💥 Boundary 4/6', 
      multiplier: '4.0x', 
      desc: 'Fours & monumental sixes', 
      color: 'border-amber-950 bg-amber-950/20 text-amber-400 hover:border-amber-500/40 hover:bg-amber-950/40' 
    },
    { 
      id: 'wicket', 
      label: '☠️ Wicket', 
      multiplier: '8.0x', 
      desc: 'Batsman dismissed', 
      color: 'border-rose-950 bg-rose-950/20 text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/40' 
    }
  ];

  const getBotBadge = (username) => {
    if (username.includes('Rizzler')) return '🔥 STREAK';
    if (username.includes('Finisher')) return '👑 THALA';
    if (username.includes('Power')) return '🧠 TACTICAL';
    if (username.includes('Sword')) return '⚔️ JADDU';
    return '🤖 BOT';
  };

  const getBotBadgeStyle = (username) => {
    if (username.includes('Rizzler')) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (username.includes('Finisher')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (username.includes('Power')) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    if (username.includes('Sword')) return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    return 'bg-slate-800 text-slate-400 border border-slate-700/30';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* Prediction Betting Console */}
      <div className="lg:col-span-8 glass-panel rounded-3xl p-6 glow-indigo flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Onboarding Mode: Not Joined Yet */}
        {!joinedGame ? (
          <div className="py-6 text-center max-w-lg mx-auto space-y-6">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 blur opacity-70 animate-pulse"></div>
              <div className="relative bg-slate-950 border border-white/10 rounded-full p-4">
                <Award className="w-8 h-8 text-amber-400 mx-auto" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-outfit text-white tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Enter the Predictor Arena
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Connect your neural strategic chip. Wager virtual tokens, out-predict our autonomous agents, and dominate the Chinnaswamy!
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-5">
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.substring(0, 16))}
                  placeholder="Enter your custom Gladiator Name..." 
                  maxLength={16}
                  className="w-full glass-input rounded-2xl px-5 py-3.5 text-sm text-slate-200 border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 bg-slate-950/60"
                  required
                />
                <User className="absolute right-4 top-3.5 w-4 h-4 text-slate-500" />
              </div>

              {/* Faction Selectors (Unicorn Red/Yellow Design) */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Select Your Faction</span>
                <div className="grid grid-cols-2 gap-4">
                  {/* RCB Faction */}
                  <button
                    type="button"
                    onClick={() => setFavoriteTeam('RCB')}
                    className={`group relative p-4 rounded-2xl border text-left transition-all overflow-hidden flex flex-col justify-between gap-4 ${
                      favoriteTeam === 'RCB' 
                        ? 'border-red-500/80 bg-red-950/30 glow-rose ring-1 ring-red-500/40' 
                        : 'border-white/5 bg-slate-950/60 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-2xl">❤️</span>
                      <span className={`text-[8px] font-mono tracking-widest px-2 py-0.5 rounded-full font-bold uppercase ${
                        favoriteTeam === 'RCB' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-500'
                      }`}>RED ARMY</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-outfit text-white">RCB Bold</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Cheer for King Kohli & the Chinnaswamy Red Army.</p>
                    </div>
                  </button>

                  {/* CSK Faction */}
                  <button
                    type="button"
                    onClick={() => setFavoriteTeam('CSK')}
                    className={`group relative p-4 rounded-2xl border text-left transition-all overflow-hidden flex flex-col justify-between gap-4 ${
                      favoriteTeam === 'CSK' 
                        ? 'border-amber-400/80 bg-amber-950/30 glow-amber ring-1 ring-amber-400/40' 
                        : 'border-white/5 bg-slate-950/60 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-2xl">💛</span>
                      <span className={`text-[8px] font-mono tracking-widest px-2 py-0.5 rounded-full font-bold uppercase ${
                        favoriteTeam === 'CSK' ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-slate-500'
                      }`}>WHISTLE PODU</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-outfit text-white">CSK Super</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Back the legendary Thala Dhoni & Yellow Lions.</p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all font-outfit text-sm uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Connect Strategy Deck (+1,000 Credits)
              </button>
            </form>
          </div>
        ) : (
          /* Active Playing Mode */
          <div className="space-y-5">
            
            {/* Header: Title & Timer */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold font-outfit text-slate-200">Neural Predictor Console</h3>
              </div>

              {/* Countdown Ticker */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-colors ${
                countdown > 0 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <Timer className="w-4 h-4" />
                {countdown > 0 ? `WAGER OPEN: ${countdown}S` : 'LOCKED / DELIVERING'}
              </div>
            </div>

            {/* Holographic AI Hint Box */}
            <div className="relative bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex gap-3.5 items-start overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 h-full"></div>
              <span className="text-xl filter drop-shadow">💡</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono">CricAI Holographic Advisory</h5>
                  <span className="text-[7px] font-mono px-1 rounded bg-indigo-500/10 text-indigo-400 uppercase tracking-widest border border-indigo-500/20 animate-pulse">Scanning Live</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{aiHint}</p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Prediction Grid Options */}
            <div className="grid grid-cols-2 gap-4">
              {predictionOptions.map((opt) => {
                const isSelected = selectedChoice === opt.id;
                const isLocked = lockedPrediction?.choice === opt.id;
                const disabled = countdown <= 0 || predictionPlaced;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handlePredict(opt.id)}
                    disabled={disabled}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all relative overflow-hidden group ${opt.color} ${
                      isSelected || isLocked ? 'ring-2 ring-indigo-500 scale-98 border-transparent bg-slate-900/40' : ''
                    } ${disabled && !isSelected && !isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                  >
                    {/* Glowing highlight */}
                    {(isSelected || isLocked) && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-slate-950 rounded-bl-xl px-2 py-0.5 text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Selected
                      </div>
                    )}

                    <div className="w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                        <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">{opt.multiplier}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal font-mono">{opt.desc}</p>
                    </div>

                    {isLocked && (
                      <div className="text-[10px] text-indigo-300 font-mono mt-2 pt-2 border-t border-white/5 flex justify-between items-center w-full">
                        <span>Locked Wager</span>
                        <strong className="text-white font-bold">{lockedPrediction.wager} pts</strong>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Wager Sliders & Balance Tracker */}
            {!predictionPlaced && countdown > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest">Wager Credits</span>
                  <span className="font-mono text-slate-200 bg-slate-950 border border-white/10 px-3 py-1 rounded-xl font-bold text-xs shadow-inner">
                    {wager} / {userProfile.points} Credits
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10}
                    max={userProfile.points}
                    step={10}
                    value={wager}
                    onChange={(e) => setWager(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg bg-slate-800"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setWager(Math.max(10, Math.round(userProfile.points * 0.25)))}
                      className="text-[9px] bg-slate-900 border border-white/5 hover:bg-slate-800 hover:border-white/10 text-slate-300 px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => setWager(Math.max(10, Math.round(userProfile.points * 0.5)))}
                      className="text-[9px] bg-slate-900 border border-white/5 hover:bg-slate-800 hover:border-white/10 text-slate-300 px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setWager(userProfile.points)}
                      className="text-[9px] bg-slate-900 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
            )}

            {predictionPlaced && (
              <p className="text-[10px] text-slate-500 text-center italic font-mono uppercase tracking-wider animate-pulse pt-2">
                ⚡ Wager locked on quantum core. awaiting bowler delivery release...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Leaderboard Panel */}
      <div className="lg:col-span-4 glass-panel rounded-3xl p-5 glow-indigo flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black text-slate-300 font-outfit uppercase tracking-wider">Live Gladiator Standings</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest">RANKING</span>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {leaderboard.map((item, idx) => {
              const isUser = item.username === userProfile?.username && !item.isBot;
              const isRcb = item.team === 'RCB';
              
              return (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-2.5 rounded-2xl border transition-all ${
                    isUser 
                      ? 'bg-indigo-600/10 border-indigo-500/30 glow-indigo' 
                      : 'bg-slate-950/40 border-white/5 hover:bg-slate-900/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5.5 h-5.5 rounded-xl flex items-center justify-center text-[10px] font-black font-mono shadow-inner ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' : 
                      idx === 1 ? 'bg-slate-300 text-slate-900' : 
                      idx === 2 ? 'bg-amber-600 text-white' : 
                      'bg-slate-900 text-slate-400 border border-white/5'
                    }`}>
                      {item.rank}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black truncate max-w-[100px] leading-none ${isUser ? 'text-indigo-400 font-black' : 'text-slate-300'}`}>
                          {item.username}
                        </span>
                        {/* Faction Badge */}
                        <span className={`text-[7px] font-black font-mono px-1 py-0.2 rounded uppercase ${
                          isRcb ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.team}
                        </span>
                      </div>
                      
                      {/* Custom Gamification Badge */}
                      <span className={`text-[7px] font-mono px-1 py-0.2 rounded w-fit uppercase ${getBotBadgeStyle(item.username)}`}>
                        {isUser ? '🔥 YOU' : getBotBadge(item.username)}
                      </span>
                    </div>
                  </div>

                  <strong className="text-xs font-mono text-amber-400 tracking-tight">{item.points} pts</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[8px] text-slate-500 flex justify-between uppercase font-mono tracking-widest leading-relaxed">
          <span>Min wager: 10 Creds</span>
          <span>Balanced Standings Active</span>
        </div>
      </div>
      
    </div>
  );
}
