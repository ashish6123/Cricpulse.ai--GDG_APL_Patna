// frontend/src/components/MatchAdmin.jsx
import React, { useState } from 'react';
import { Settings, Play, Pause, RotateCcw, ShieldAlert, Globe, PlusCircle, Layers } from 'lucide-react';

export default function MatchAdmin({ socket, autoPlayActive, matchState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Custom Form Builder State
  const [customSetup, setCustomSetup] = useState({
    battingTeam: 'MI',
    bowlingTeam: 'KKR',
    target: '195',
    runs: '120',
    wickets: '4',
    overs: '14.2',
    ballsRemaining: '34',
    currentBatsman: 'Rohit Sharma',
    currentNonStriker: 'Suryakumar Yadav',
    currentBowler: 'Sunil Narine'
  });

  if (!matchState) return null;

  const handleToggleAutoplay = () => {
    socket.emit('admin-toggle-autoplay', !autoPlayActive);
  };

  const handleTriggerBall = (runs, isWicket = false) => {
    const { currentBatsman, currentBowler } = matchState;
    let speed = `${(132 + Math.random() * 15).toFixed(1)} km/h`;
    let type = "Good length delivery";

    if (runs === 6) {
      type = "Slower half-tracker";
    } else if (runs === 4) {
      type = "Overpitched outswinger";
    } else if (isWicket) {
      type = "Inswinging Yorker";
    }

    const payload = {
      runs: isWicket ? 'W' : runs,
      wicket: isWicket ? {
        player: currentBatsman,
        type: "Dismissed",
        description: "Beaten by sheer pace, dynamic admin override!"
      } : null,
      wicketDescription: isWicket ? "Beaten by sheer pace, dynamic admin override!" : "",
      batsman: currentBatsman,
      bowler: currentBowler,
      ballType: type,
      ballSpeed: speed
    };

    socket.emit('admin-trigger-ball', payload);
  };

  const handleReset = () => {
    if (window.confirm("Reset match simulation back to ball 1 (RCB vs CSK Playoff Decider)? This will clear predictions and re-wire gladiator cores.")) {
      socket.emit('admin-reset');
      setShowBuilder(false);
    }
  };

  const handlePresetSelect = (presetType) => {
    let setup = {};
    if (presetType === 'rcb_csk') {
      setup = {
        battingTeam: 'RCB',
        bowlingTeam: 'CSK',
        target: '219',
        runs: '165',
        wickets: '5',
        overs: '15.0',
        ballsRemaining: '30',
        currentBatsman: 'Virat Kohli',
        currentNonStriker: 'Glenn Maxwell',
        currentBowler: 'Matheesha Pathirana'
      };
    } else if (presetType === 'mi_kkr') {
      setup = {
        battingTeam: 'MI',
        bowlingTeam: 'KKR',
        target: '195',
        runs: '120',
        wickets: '4',
        overs: '14.2',
        ballsRemaining: '34',
        currentBatsman: 'Rohit Sharma',
        currentNonStriker: 'Suryakumar Yadav',
        currentBowler: 'Sunil Narine'
      };
    } else if (presetType === 'srh_gt') {
      setup = {
        battingTeam: 'SRH',
        bowlingTeam: 'GT',
        target: '262',
        runs: '210',
        wickets: '3',
        overs: '16.0',
        ballsRemaining: '24',
        currentBatsman: 'Heinrich Klaasen',
        currentNonStriker: 'Travis Head',
        currentBowler: 'Rashid Khan'
      };
    }

    socket.emit('admin-initialize-match', setup);
    alert(`Active stadium successfully synced to live ${setup.battingTeam} vs ${setup.bowlingTeam} feed! All chatbots, casters, and tickers have adapted.`);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const setup = {
      ...customSetup,
      target: parseInt(customSetup.target),
      runs: parseInt(customSetup.runs),
      wickets: parseInt(customSetup.wickets),
      ballsRemaining: parseInt(customSetup.ballsRemaining)
    };
    socket.emit('admin-initialize-match', setup);
    alert(`Successfully compiled custom live match: ${setup.battingTeam} vs ${setup.bowlingTeam}! Feed is now active.`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-outfit">
      
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border focus:outline-none ${
          isOpen 
            ? 'bg-rose-600 border-rose-500 text-white rotate-90 scale-95' 
            : 'bg-slate-900/90 border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:scale-105 hover:border-indigo-500'
        }`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Admin Panel Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 max-h-[80vh] overflow-y-auto glass-panel rounded-3xl p-5 shadow-2xl glow-indigo border border-indigo-500/20 space-y-4 transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">stadium live feed engine</h4>
            </div>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">DYNAMIC SYNC</span>
          </div>

          {/* Autoplay Loop Controller */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Automatic Live Autoplay</span>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                autoPlayActive ? 'bg-emerald-500/25 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {autoPlayActive ? 'ACTIVE (14s/ball)' : 'PAUSED'}
              </span>
            </div>

            <button
              onClick={handleToggleAutoplay}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                autoPlayActive 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {autoPlayActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoPlayActive ? 'Pause Autoplay' : 'Resume Autoplay'}
            </button>
          </div>

          {/* Preset Matches (compatibility for every live match!) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
              🚀 Load Live Match Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePresetSelect('rcb_csk')}
                className="py-1.5 bg-rose-950/40 border border-red-500/20 hover:border-red-500 text-[10px] font-bold rounded-lg text-slate-200 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-red-500">❤️ RCB</span>
                <span className="text-[8px] text-slate-500">vs CSK</span>
              </button>
              <button
                onClick={() => handlePresetSelect('mi_kkr')}
                className="py-1.5 bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500 text-[10px] font-bold rounded-lg text-slate-200 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-indigo-400">💙 MI</span>
                <span className="text-[8px] text-slate-500">vs KKR</span>
              </button>
              <button
                onClick={() => handlePresetSelect('srh_gt')}
                className="py-1.5 bg-amber-950/40 border border-amber-500/20 hover:border-amber-500 text-[10px] font-bold rounded-lg text-slate-200 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-amber-400">🧡 SRH</span>
                <span className="text-[8px] text-slate-500">vs GT</span>
              </button>
            </div>
          </div>

          {/* Toggle Dynamic Match Builder */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="w-full py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-xs text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {showBuilder ? <Layers className="w-3.5 h-3.5 text-rose-400" /> : <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />}
              {showBuilder ? 'Hide Live Builder' : 'Open Live Custom Match Builder'}
            </button>

            {showBuilder && (
              <form onSubmit={handleCustomSubmit} className="space-y-3 bg-slate-950/90 border border-indigo-500/25 p-4 rounded-2xl animate-fade-in mt-2">
                <h5 className="text-[10px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-indigo-400" /> Custom Match Parameters
                </h5>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Batting Team</label>
                    <input 
                      type="text" 
                      value={customSetup.battingTeam} 
                      onChange={(e) => setCustomSetup({...customSetup, battingTeam: e.target.value.toUpperCase()})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Bowling Team</label>
                    <input 
                      type="text" 
                      value={customSetup.bowlingTeam} 
                      onChange={(e) => setCustomSetup({...customSetup, bowlingTeam: e.target.value.toUpperCase()})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Target Score</label>
                    <input 
                      type="number" 
                      value={customSetup.target} 
                      onChange={(e) => setCustomSetup({...customSetup, target: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Current Score</label>
                    <input 
                      type="number" 
                      value={customSetup.runs} 
                      onChange={(e) => setCustomSetup({...customSetup, runs: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Wickets Fallen</label>
                    <input 
                      type="number" 
                      value={customSetup.wickets} 
                      onChange={(e) => setCustomSetup({...customSetup, wickets: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Overs Bowled</label>
                    <input 
                      type="text" 
                      value={customSetup.overs} 
                      onChange={(e) => setCustomSetup({...customSetup, overs: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Balls Remaining</label>
                    <input 
                      type="number" 
                      value={customSetup.ballsRemaining} 
                      onChange={(e) => setCustomSetup({...customSetup, ballsRemaining: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Current Striker</label>
                    <input 
                      type="text" 
                      value={customSetup.currentBatsman} 
                      onChange={(e) => setCustomSetup({...customSetup, currentBatsman: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-500 block mb-0.5">Current Bowler</label>
                    <input 
                      type="text" 
                      value={customSetup.currentBowler} 
                      onChange={(e) => setCustomSetup({...customSetup, currentBowler: e.target.value})}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 w-full font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-[10px] font-black uppercase text-white rounded-xl shadow-lg shadow-indigo-500/10 tracking-widest mt-2"
                >
                  📡 Sync Dynamic Live Match Feed
                </button>
              </form>
            )}
          </div>

          {/* Direct Ball Overrides */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Inject Custom Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerBall(6)}
                className="py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 text-amber-300 text-xs font-bold transition-all"
              >
                💥 Six!
              </button>
              <button
                onClick={() => handleTriggerBall(4)}
                className="py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 text-indigo-300 text-xs font-bold transition-all"
              >
                🏏 Four!
              </button>
              <button
                onClick={() => handleTriggerBall(1)}
                className="py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 text-emerald-300 text-xs font-bold transition-all"
              >
                🏃 Single
              </button>
              <button
                onClick={() => handleTriggerBall(0)}
                className="py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 text-xs font-bold transition-all"
              >
                🛑 Dot Ball
              </button>
            </div>

            <button
              onClick={() => handleTriggerBall(0, true)}
              className="w-full py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              🚨 Trigger Wicket!
            </button>
          </div>

          {/* Reset Control */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={handleReset}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Chinnaswamy Playoff
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
