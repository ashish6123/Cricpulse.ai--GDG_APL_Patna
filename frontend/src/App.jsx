// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Sparkles, Tv, Wifi, AlertTriangle } from 'lucide-react';

import ScoreBoard from './components/ScoreBoard';
import PulseTracker from './components/PulseTracker';
import PredictorArena from './components/PredictorArena';
import CommentaryFeed from './components/CommentaryFeed';
import CopilotChat from './components/CopilotChat';
import NewsroomAgent from './components/NewsroomAgent';
import MatchAdmin from './components/MatchAdmin';
import AgentThoughts from './components/AgentThoughts';
import RivalryRooms from './components/RivalryRooms';
import LiveMatchSelector from './components/LiveMatchSelector';

// Connect to backend
const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const socket = io(SOCKET_URL);

// Web Audio API Synthesizer (Zero-Assets Procedural Sound Effects)
const playSynthSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'coin') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now); // B5 note
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6 note
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'win') {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        
        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    }
    else if (type === 'wicket') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      
      osc1.frequency.setValueAtTime(300, now);
      osc2.frequency.setValueAtTime(303, now); // detune
      
      osc1.frequency.linearRampToValueAtTime(90, now + 0.65); // downward sweep
      osc2.frequency.linearRampToValueAtTime(92, now + 0.65);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    }
    else if (type === 'cheer') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.25);
      osc.frequency.linearRampToValueAtTime(150, now + 0.9);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.Q.setValueAtTime(1.5, now);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.9);
    }
  } catch (e) {
    console.warn("Web Audio Context not allowed or supported by user permissions yet.", e);
  }
};

export default function App() {
  const [matchState, setMatchState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [joinedGame, setJoinedGame] = useState(false);
  const [userProfile, setUserProfile] = useState({ username: '', points: 1000, team: '' });
  const [countdown, setCountdown] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentCommentaries, setCurrentCommentaries] = useState(null);
  const [newsTimeline, setNewsTimeline] = useState([]);
  
  const [poll, setPoll] = useState(null);
  const [pollVotedOption, setPollVotedOption] = useState(null);
  const [activeMeme, setActiveMeme] = useState('');
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  // Agent thoughts terminal logs state
  const [agentThoughts, setAgentThoughts] = useState([]);

  // Faction choice drives global colors ('RCB' or 'CSK')
  const [favoriteFaction, setFavoriteFaction] = useState('RCB');

  // Interactive screen flashes and shake overlay states
  const [flashEffect, setFlashEffect] = useState(null); // 'six-flash', 'four-flash', 'wicket-flash'
  const [screenShake, setScreenShake] = useState(false);

  const [copilotChat, setCopilotChat] = useState(null);
  const [copilotTyping, setCopilotTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);

  // Live events ticker — last 10 key ball events
  const [tickerEvents, setTickerEvents] = useState([
    '🏏 CricPulse AI is live — Select a match to begin',
    '⚡ 5 AI agents are online and ready',
    '🎯 Predict every ball and win virtual tokens',
    '📡 Real-time data feeds active',
    '🤖 Multi-agent commentary engine initialized',
  ]);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to CricPulse Server!');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from CricPulse Server');
    });

    socket.on('initial-state', (payload) => {
      setMatchState(payload.matchState);
      setLeaderboard(payload.leaderboard);
      setAutoPlayActive(payload.autoPlayActive);
      setPoll(payload.poll);
      if (payload.matchState && payload.matchState.history) {
        setHistory(payload.matchState.history);
      }
    });

    socket.on('join-success', (profile) => {
      setUserProfile(profile);
      setJoinedGame(true);
      setFavoriteFaction(profile.team);
      playSynthSound('win');
      showToast({
        title: `Joined ${profile.team === 'RCB' ? 'RCB Red Army!' : 'CSK Whistle Podu!'}`,
        message: `Welcome ${profile.username}! +1,000 credits loaded into your gladiator core.`,
        type: "success"
      });
    });

    socket.on('countdown-tick', (time) => {
      setCountdown(time);
    });

    socket.on('prediction-result', (res) => {
      setUserProfile((prev) => ({ ...prev, points: res.points }));
      if (res.correct) {
        playSynthSound('win');
        showToast({
          title: "🎯 PREDICTION SUCCESS!",
          message: `Your strategic guess was correct! Secured +${res.gain} credits.`,
          type: "success"
        });
      } else {
        playSynthSound('wicket'); // slight buzz sound
        showToast({
          title: "❌ PREDICTION DEFEATED",
          message: `Better luck next delivery! Lost ${Math.abs(res.gain)} credits.`,
          type: "error"
        });
      }
    });

    socket.on('autoplay-status', (status) => {
      setAutoPlayActive(status);
    });

    socket.on('leaderboard-update', (board) => {
      setLeaderboard(board);
    });

    socket.on('poll-update', (p) => {
      setPoll(p);
    });

    socket.on('vote-success', (idx) => {
      setPollVotedOption(idx);
      playSynthSound('coin');
      showToast({
        title: "SENTIMENT LOGGED!",
        message: "Your fan bias is counted. +50 credits pending!",
        type: "success"
      });
    });

    socket.on('prediction-placed', (data) => {
      setUserProfile((prev) => ({ ...prev, points: prev.points - data.pointsBet }));
      playSynthSound('coin');
      showToast({
        title: "Wager Committed!",
        message: `Locked ${data.pointsBet} credits on ${data.choice.toUpperCase()}.`,
        type: "info"
      });
    });

    socket.on('copilot-typing', (status) => {
      setCopilotTyping(status);
    });

    socket.on('copilot-reply', (chat) => {
      setCopilotChat(chat);
    });

    socket.on('loading-next-ball', (status) => {
      setIsLoadingNext(status);
    });

    socket.on('error-msg', (msg) => {
      showToast({
        title: "Warning",
        message: msg,
        type: "warning"
      });
    });

    // Core Ball Outcome Listener
    socket.on('new-ball-update', (payload) => {
      const { ball, matchState: state, commentaries, newsroom, engagement, agentThoughts } = payload;
      
      setMatchState(state);
      setCurrentCommentaries(commentaries);
      setAgentThoughts(agentThoughts || []);

      // Trigger screen overlays and synthesized audios based on outcome
      if (ball.wicket !== null) {
        setFlashEffect('wicket-flash');
        setScreenShake(true);
        playSynthSound('wicket');
        playSynthSound('cheer');
        setTimeout(() => setScreenShake(false), 450);
        setTimeout(() => setFlashEffect(null), 1800);
      } else if (ball.runs === 6) {
        setFlashEffect('six-flash');
        playSynthSound('win');
        playSynthSound('cheer');
        setTimeout(() => setFlashEffect(null), 1500);
      } else if (ball.runs === 4) {
        setFlashEffect('four-flash');
        playSynthSound('win');
        playSynthSound('cheer');
        setTimeout(() => setFlashEffect(null), 1200);
      } else {
        playSynthSound('coin');
      }

      setHistory((prev) => [
        {
          ...ball,
          commentaries
        },
        ...prev
      ]);

      // Update live ticker with the latest ball result
      const tickerMsg = ball.wicket
        ? `☠️ WICKET! ${ball.wicket.player} dismissed by ${ball.bowler}`
        : ball.runs === 6 ? `💥 SIX! ${ball.batsman} off ${ball.bowler} — massive shot!`
        : ball.runs === 4 ? `⚡ FOUR! ${ball.batsman} finds the boundary`
        : `⚽ Over ${ball.over}: ${ball.runs} run${ball.runs !== 1 ? 's' : ''} — ${ball.bowler} bowling`;
      setTickerEvents(prev => [tickerMsg, ...prev].slice(0, 12));

      if (newsroom) {
        setNewsTimeline((prev) => [
          {
            ...newsroom,
            over: ball.over
          },
          ...prev
        ]);
      }

      if (engagement) {
        setPoll(engagement.poll);
        setPollVotedOption(null);
        setActiveMeme(engagement.meme);
      }

      setLeaderboard(payload.leaderboard);
    });

    socket.on('match-ended', (state) => {
      setMatchState(state);
      playSynthSound('win');
      showToast({
        title: "🏆 MATCH CONCLUDED!",
        message: `${state.battingTeam} chase has finalized! Re-read timeline news packages.`,
        type: "info"
      });
    });

    socket.on('match-reset', (payload) => {
      setMatchState(payload.matchState);
      setLeaderboard(payload.leaderboard);
      setPoll(payload.poll);
      setHistory([]);
      setCurrentCommentaries(null);
      setNewsTimeline([]);
      setPollVotedOption(null);
      setActiveMeme('');
      setAgentThoughts([]);
      setJoinedGame(false);
      setUserProfile({ username: '', points: 1000, team: '' });
      showToast({
        title: "Simulation Reset",
        message: "Match rewound back to over 16.1. Gladiator deck reloaded!",
        type: "info"
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial-state');
      socket.off('join-success');
      socket.off('countdown-tick');
      socket.off('prediction-result');
      socket.off('autoplay-status');
      socket.off('leaderboard-update');
      socket.off('poll-update');
      socket.off('vote-success');
      socket.off('prediction-placed');
      socket.off('copilot-typing');
      socket.off('copilot-reply');
      socket.off('loading-next-ball');
      socket.off('new-ball-update');
      socket.off('match-ended');
      socket.off('match-reset');
      socket.off('error-msg');
    };
  }, []);

  const showToast = ({ title, message, type }) => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const getFactionColors = () => {
    if (favoriteFaction === 'RCB') {
      return {
        bg: 'from-rose-950/20 via-slate-950 to-slate-950',
        glow: 'glow-rose border-red-500/10',
        grid: 'rgba(239, 68, 68, 0.02)',
        headerGlow: 'shadow-[0_1px_15px_-3px_rgba(239,68,68,0.2)] border-red-500/15'
      };
    } else {
      return {
        bg: 'from-amber-950/20 via-slate-950 to-slate-950',
        glow: 'glow-amber border-amber-500/10',
        grid: 'rgba(245, 158, 11, 0.02)',
        headerGlow: 'shadow-[0_1px_15px_-3px_rgba(245,158,11,0.2)] border-amber-500/15'
      };
    }
  };

  const currentTheme = getFactionColors();

  return (
    <div className={`min-h-screen bg-stadium text-slate-100 pb-16 font-sans relative overflow-x-hidden transition-all duration-700 ${screenShake ? 'shake-active' : ''}`}>
      
      {/* Self-contained keyframe styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-6px, -3px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translate(6px, 3px) rotate(0.5deg); }
        }
        .shake-active {
          animation: shake 0.4s ease-in-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .glow-rose {
          box-shadow: 0 0 40px -15px rgba(239, 68, 68, 0.15);
        }
        .glow-amber {
          box-shadow: 0 0 40px -15px rgba(245, 158, 11, 0.15);
        }
      `}</style>

      {/* Interactive visual flashes (Boundary & Wicket Sweeps) */}
      {flashEffect === 'wicket-flash' && (
        <div className="fixed inset-0 bg-red-600/20 backdrop-blur-xs z-40 pointer-events-none transition-all duration-300 animate-pulse flex items-center justify-center">
          <div className="bg-red-950/80 border border-red-500 text-red-200 px-8 py-4 rounded-3xl font-black font-outfit uppercase tracking-widest text-lg shadow-2xl animate-bounce">
            🔴 Wicket Dismissal!
          </div>
        </div>
      )}
      {flashEffect === 'six-flash' && (
        <div className="fixed inset-0 bg-gradient-to-tr from-amber-500/20 to-yellow-500/25 z-40 pointer-events-none transition-all duration-300 flex items-center justify-center">
          <div className="bg-amber-950/80 border border-amber-400 text-amber-200 px-8 py-4 rounded-3xl font-black font-outfit uppercase tracking-widest text-lg shadow-2xl animate-bounce">
            🏏 towering SIX!
          </div>
        </div>
      )}
      {flashEffect === 'four-flash' && (
        <div className="fixed inset-0 bg-indigo-600/10 z-40 pointer-events-none transition-all duration-300 flex items-center justify-center">
          <div className="bg-indigo-950/80 border border-indigo-500 text-indigo-200 px-8 py-4 rounded-3xl font-black font-outfit uppercase tracking-widest text-lg shadow-2xl animate-bounce">
            ⚡ Cracking FOUR!
          </div>
        </div>
      )}

      {/* Grid pattern overlay dynamically matching Faction theme colors */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40"
        style={{ backgroundColor: currentTheme.grid }}
      ></div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl border shadow-2xl flex items-start gap-3 w-80 sm:w-96 transition-all duration-300 font-outfit animate-float ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/5' :
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/5' :
          toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-500/5' :
          'bg-slate-900/95 border-indigo-500/50 text-indigo-200 shadow-indigo-500/5'
        }`}>
          <div className="text-xl">
            {toast.type === 'success' ? '🎯' : toast.type === 'error' ? '💥' : '⚠️'}
          </div>
          <div>
            <h5 className="font-bold text-xs">{toast.title}</h5>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Scanline overlay — unique cyberpunk effect */}
      <div className="scanline" aria-hidden="true" />

      {/* ===== PREMIUM HEADER ===== */}
      <header className={`border-b backdrop-blur-xl sticky top-0 z-30 transition-all duration-700 bg-slate-950/90 ${currentTheme.headerGlow}`}>
        {/* Main header row */}
        <div className="px-4 sm:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 blur-md opacity-60" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight font-outfit flex items-baseline gap-2">
                <span className="text-shimmer">CricPulse AI</span>
                <span className="text-[7px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-code uppercase tracking-widest border border-indigo-500/20">GAPL ✦</span>
              </h1>
              <p className="text-[8px] text-slate-500 font-code tracking-widest uppercase mt-0.5">Second-Screen Sports Intelligence Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Match state quick-view */}
            {matchState && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                </div>
                <span className="text-[10px] font-bold font-code text-slate-300">
                  {matchState.battingTeam} {matchState.runs}/{matchState.wickets}
                </span>
                <span className="text-[9px] text-slate-500">• {matchState.overs} ov</span>
              </div>
            )}
            {/* Connection badge */}
            {connected ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] text-emerald-400 font-bold font-code">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full text-[9px] text-rose-400 font-bold font-code animate-pulse">
                <AlertTriangle className="w-3 h-3" /> CONNECTING
              </div>
            )}
          </div>
        </div>

        {/* Live events ticker bar */}
        <div className="border-t border-white/5 bg-slate-950/50 overflow-hidden py-1.5">
          <div className="flex ticker-track whitespace-nowrap">
            {[...tickerEvents, ...tickerEvents].map((event, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-[9px] font-code text-slate-400">
                {event}
                <span className="text-indigo-500/40 mx-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main App Content Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 relative z-10">
        
        {/* Row 1: Live Scoreboard */}
        <ScoreBoard 
          matchState={matchState} 
          username={userProfile.username} 
          userPoints={userProfile.points} 
          userTeam={userProfile.team} 
        />

        {/* Row 2: Live Match Selector + PulseTracker + Agent Thoughts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Live match browser */}
          <div className="lg:col-span-4 flex flex-col justify-stretch">
            <LiveMatchSelector
              socket={socket}
              onMatchSelected={(setup) => {
                setTickerEvents(prev => [
                  `📡 Match synced: ${setup.battingTeam} vs ${setup.bowlingTeam}`,
                  ...prev
                ].slice(0, 12));
              }}
            />
          </div>
          {/* Momentum & Win Probability */}
          <div className="lg:col-span-5 flex flex-col justify-stretch">
            <PulseTracker
              winProbability={matchState?.winProbability}
              momentum={matchState?.momentum}
              hypeLevel={matchState?.hypeLevel}
              battingTeam={matchState?.battingTeam}
              bowlingTeam={matchState?.bowlingTeam}
            />
          </div>
          {/* Agent Thoughts Terminal */}
          <div className="lg:col-span-3 flex flex-col justify-stretch">
            <AgentThoughts agentThoughts={agentThoughts} />
          </div>
        </div>

        {/* Row 3: Predictor Arena Panel */}
        <PredictorArena 
          socket={socket} 
          joinedGame={joinedGame} 
          userProfile={userProfile} 
          leaderboard={leaderboard} 
          countdown={countdown} 
          matchState={matchState} 
          onFactionSelect={(faction) => {
            setFavoriteFaction(faction);
            playSynthSound('win');
          }}
        />

        {/* Row 4: Syndicate Rivalry Arena & Newsroom Agent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <RivalryRooms 
              socket={socket} 
              matchState={matchState} 
              userProfile={userProfile} 
            />
          </div>
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <NewsroomAgent newsTimeline={newsTimeline} />
          </div>
        </div>

        {/* Row 5: Dynamic Alternate Commentary & Q&A strategic copilot chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Alternate Commentary stream */}
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <CommentaryFeed 
              history={history} 
              currentCommentaries={currentCommentaries} 
              isLoading={isLoadingNext} 
            />
          </div>

          {/* CricAI Strategic Copilot (Chat & poll system) */}
          <div className="lg:col-span-6 flex flex-col justify-stretch">
            <CopilotChat 
              socket={socket} 
              joinedGame={joinedGame} 
              copilotChat={copilotChat} 
              copilotTyping={copilotTyping} 
              poll={poll} 
              pollVotedOption={pollVotedOption}
              activeMeme={activeMeme}
            />
          </div>
        </div>

      </main>

      {/* Admin Panel manager floating settings */}
      <MatchAdmin 
        socket={socket} 
        autoPlayActive={autoPlayActive} 
        matchState={matchState} 
      />

    </div>
  );
}
