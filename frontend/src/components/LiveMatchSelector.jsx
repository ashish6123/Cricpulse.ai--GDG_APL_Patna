// frontend/src/components/LiveMatchSelector.jsx
// Real-time live match browser — polls backend /api/live-matches
// Shows actual live games when API key set, or simulation presets as fallback

import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Zap, Globe, ChevronRight, Wifi, WifiOff } from 'lucide-react';

const SOCKET_HOST = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

// Simulation preset matches shown when no API key is configured
const SIM_PRESETS = [
  {
    id: 'rcb_csk',
    name: 'RCB vs CSK — IPL Playoff Decider',
    status: 'RCB: 165/5 (15.0) | Need 54 off 30',
    matchType: 'T20',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    teams: ['RCB', 'CSK'],
    simKey: 'rcb_csk',
    hot: true,
  },
  {
    id: 'mi_kkr',
    name: 'MI vs KKR — Wankhede Derby',
    status: 'MI: 120/4 (14.2) | Need 75 off 34',
    matchType: 'T20',
    venue: 'Wankhede Stadium, Mumbai',
    teams: ['MI', 'KKR'],
    simKey: 'mi_kkr',
    hot: false,
  },
  {
    id: 'srh_gt',
    name: 'SRH vs GT — High-Score Thriller',
    status: 'SRH: 210/3 (16.0) | Need 52 off 24',
    matchType: 'T20',
    venue: 'Rajiv Gandhi Intl. Stadium, Hyderabad',
    teams: ['SRH', 'GT'],
    simKey: 'srh_gt',
    hot: false,
  },
];

const TEAM_COLORS = {
  RCB:  { bg: 'from-red-950/60 to-rose-950/40',    border: 'border-red-500/30',    dot: 'bg-red-500',    abbr: 'bg-red-600' },
  CSK:  { bg: 'from-amber-950/60 to-yellow-950/40', border: 'border-amber-400/30',  dot: 'bg-amber-400',  abbr: 'bg-amber-500' },
  MI:   { bg: 'from-blue-950/60 to-sky-950/40',     border: 'border-blue-500/30',   dot: 'bg-blue-500',   abbr: 'bg-blue-600' },
  KKR:  { bg: 'from-purple-950/60 to-violet-950/40',border: 'border-purple-500/30', dot: 'bg-purple-500', abbr: 'bg-purple-600' },
  SRH:  { bg: 'from-orange-950/60 to-amber-950/40', border: 'border-orange-500/30', dot: 'bg-orange-500', abbr: 'bg-orange-600' },
  GT:   { bg: 'from-teal-950/60 to-cyan-950/40',    border: 'border-teal-500/30',   dot: 'bg-teal-500',   abbr: 'bg-teal-600' },
  DC:   { bg: 'from-blue-950/60 to-indigo-950/40',  border: 'border-blue-400/30',   dot: 'bg-blue-400',   abbr: 'bg-blue-700' },
  RR:   { bg: 'from-pink-950/60 to-rose-950/40',    border: 'border-pink-500/30',   dot: 'bg-pink-500',   abbr: 'bg-pink-600' },
};

const getTeamStyle = (teamName = '') => {
  const upper = teamName.toUpperCase();
  for (const key of Object.keys(TEAM_COLORS)) {
    if (upper.includes(key)) return TEAM_COLORS[key];
  }
  return { bg: 'from-slate-950/60 to-slate-900/40', border: 'border-slate-500/30', dot: 'bg-slate-500', abbr: 'bg-slate-600' };
};

const TeamBadge = ({ name }) => {
  const style = getTeamStyle(name);
  const abbr  = name?.replace(/[^A-Z]/g, '').substring(0, 3) || name?.substring(0, 3).toUpperCase() || '???';
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${style.abbr} text-white font-black text-[10px] font-outfit shadow-lg`}>
      {abbr}
    </span>
  );
};

export default function LiveMatchSelector({ socket, onMatchSelected }) {
  const [matches, setMatches]     = useState([]);
  const [simMode, setSimMode]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${SOCKET_HOST}/api/live-matches`);
      const data = await res.json();
      setSimMode(data.simMode);
      setMatches(data.simMode ? SIM_PRESETS : (data.matches || []));
    } catch {
      setMatches(SIM_PRESETS);
      setSimMode(true);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchMatches();
    // Also listen for server-pushed updates
    socket.on('live-matches-update', (liveMatches) => {
      if (liveMatches.length > 0) {
        setSimMode(false);
        setMatches(liveMatches);
        setLastRefresh(new Date());
      }
    });
    return () => socket.off('live-matches-update');
  }, [socket]);

  const handleSelectMatch = (match) => {
    setSyncing(match.id);

    let setup;
    if (simMode) {
      // Simulation preset — map to known player data
      const PRESET_DATA = {
        rcb_csk: {
          battingTeam: 'RCB', bowlingTeam: 'CSK',
          target: 219, runs: 165, wickets: 5, overs: '15.0', ballsRemaining: 30,
          currentBatsman: 'Virat Kohli', currentNonStriker: 'Glenn Maxwell', currentBowler: 'Matheesha Pathirana',
          winProbability: { batting: 38, bowling: 62 }, momentum: -15, hypeLevel: 65,
        },
        mi_kkr: {
          battingTeam: 'MI', bowlingTeam: 'KKR',
          target: 195, runs: 120, wickets: 4, overs: '14.2', ballsRemaining: 34,
          currentBatsman: 'Rohit Sharma', currentNonStriker: 'Suryakumar Yadav', currentBowler: 'Sunil Narine',
          winProbability: { batting: 45, bowling: 55 }, momentum: -10, hypeLevel: 72,
        },
        srh_gt: {
          battingTeam: 'SRH', bowlingTeam: 'GT',
          target: 262, runs: 210, wickets: 3, overs: '16.0', ballsRemaining: 24,
          currentBatsman: 'Heinrich Klaasen', currentNonStriker: 'Travis Head', currentBowler: 'Rashid Khan',
          winProbability: { batting: 62, bowling: 38 }, momentum: 35, hypeLevel: 88,
        },
      };
      setup = PRESET_DATA[match.simKey] || PRESET_DATA.rcb_csk;
    } else {
      // Real live match from API — extract team/score data
      const [team1, team2] = match.teams || [];
      const score1 = match.score?.[0];
      const runs   = score1 ? parseInt(score1.r || 0) : 100;
      const wickets= score1 ? parseInt(score1.w || 0) : 3;
      const overs  = score1 ? parseFloat(score1.o || 10).toFixed(1) : '10.0';
      setup = {
        battingTeam: team1 || 'Team A',
        bowlingTeam: team2 || 'Team B',
        target: 180,
        runs, wickets, overs,
        ballsRemaining: Math.max(1, Math.round((20 - parseFloat(overs)) * 6)),
        currentBatsman: 'Live Batter',
        currentNonStriker: 'Live Non-Striker',
        currentBowler: 'Live Bowler',
        winProbability: { batting: 50, bowling: 50 },
        momentum: 0,
        hypeLevel: 70,
      };
    }

    socket.emit('admin-initialize-match', setup);
    if (onMatchSelected) onMatchSelected(setup);
    setTimeout(() => setSyncing(null), 1500);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 glow-indigo relative overflow-hidden flex flex-col gap-4">
      {/* Decorative background element */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-600/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-outfit text-white">Live Match Selector</h3>
            <p className="text-[9px] text-slate-500 font-code uppercase tracking-widest">
              {simMode ? '● Simulation Mode — Add CRICKET_API_KEY for real data' : '🔴 Live API Feed Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* API status badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[8px] font-bold font-code uppercase tracking-wider ${
            simMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {simMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3 animate-pulse" />}
            {simMode ? 'Sim' : 'Live'}
          </div>
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 hover:border-indigo-500/40 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match cards */}
      <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-0.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500 font-code">Scanning live feeds...</p>
          </div>
        ) : matches.map((match, idx) => {
          const team1 = match.teams?.[0] || 'Team A';
          const team2 = match.teams?.[1] || 'Team B';
          const style1 = getTeamStyle(team1);
          const isSyncing = syncing === match.id;

          return (
            <button
              key={match.id || idx}
              onClick={() => handleSelectMatch(match)}
              disabled={isSyncing}
              className={`w-full text-left p-3.5 rounded-2xl border bg-gradient-to-r ${style1.bg} ${style1.border} hover:brightness-110 transition-all duration-200 group relative overflow-hidden`}
            >
              {/* Hot badge */}
              {match.hot && (
                <span className="absolute top-2 right-2 text-[8px] font-black font-code uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
                  🔥 FEATURED
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Team badges */}
                <div className="flex -space-x-2 shrink-0">
                  <TeamBadge name={team1} />
                  <TeamBadge name={team2} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 font-outfit truncate leading-tight">{match.name}</p>
                  <p className="text-[9px] text-slate-400 font-code mt-0.5 truncate">{match.status || match.venue}</p>
                  {match.matchType && (
                    <span className="text-[8px] font-bold font-code uppercase text-indigo-400/70">{match.matchType}</span>
                  )}
                </div>

                <div className="shrink-0">
                  {isSyncing ? (
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="w-3.5 h-3.5" />
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[8px] text-slate-600 font-code uppercase tracking-wider border-t border-white/5 pt-2.5">
        <span>{matches.length} match{matches.length !== 1 ? 'es' : ''} available</span>
        {lastRefresh && <span>Updated {lastRefresh.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
