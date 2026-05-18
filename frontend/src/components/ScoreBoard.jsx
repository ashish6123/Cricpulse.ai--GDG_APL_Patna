// frontend/src/components/ScoreBoard.jsx
import React from 'react';
import { Shield, Activity, Users } from 'lucide-react';

export default function ScoreBoard({ matchState, username, userPoints, userTeam }) {
  if (!matchState) return null;

  const {
    runs,
    wickets,
    overs,
    target,
    requiredRuns,
    ballsRemaining,
    currentOverHistory,
    currentBatsman,
    currentNonStriker,
    currentBowler,
    batsmen,
    bowlers,
    battingTeam,
    bowlingTeam
  } = matchState;

  const getTeamGradient = (teamName) => {
    if (!teamName) return 'from-slate-600 to-slate-800 text-white';
    const name = teamName.toUpperCase();
    if (name.includes('RCB') || name.includes('ROYAL')) return 'from-red-600 to-rose-700 text-white shadow-red-500/10';
    if (name.includes('CSK') || name.includes('CHENNAI')) return 'from-amber-400 to-yellow-600 text-slate-900 shadow-amber-500/10';
    if (name.includes('MI') || name.includes('MUMBAI')) return 'from-blue-600 to-sky-700 text-white shadow-blue-500/10';
    if (name.includes('KKR') || name.includes('KOLKATA')) return 'from-purple-600 to-indigo-700 text-white shadow-purple-500/10';
    if (name.includes('SRH') || name.includes('HYDERABAD')) return 'from-orange-500 to-amber-600 text-white shadow-orange-500/10';
    if (name.includes('GT') || name.includes('GUJARAT')) return 'from-teal-600 to-cyan-700 text-white shadow-teal-500/10';
    return 'from-slate-600 to-slate-800 text-white shadow-slate-500/10';
  };

  const getTeamAbbr = (teamName) => {
    if (!teamName) return 'TEAM';
    const name = teamName.toUpperCase();
    if (name.includes('RCB')) return 'RCB';
    if (name.includes('CSK')) return 'CSK';
    if (name.includes('MI')) return 'MI';
    if (name.includes('KKR')) return 'KKR';
    if (name.includes('SRH')) return 'SRH';
    if (name.includes('GT')) return 'GT';
    return teamName.substring(0, 3).toUpperCase();
  };

  // Formatting helpers
  const crr = ((runs / (90 - ballsRemaining + 1e-9)) * 6).toFixed(2);
  const rrr = ballsRemaining > 0 ? ((requiredRuns / ballsRemaining) * 6).toFixed(2) : "0.00";

  // Calculate percentage of target achieved
  const targetPercent = Math.min(100, (runs / target) * 100);

  const getBallBadgeClass = (ball) => {
    if (ball === 'W') return 'bg-rose-500/25 border-rose-500/50 text-rose-300 font-bold';
    if (ball === 6) return 'bg-amber-500/25 border-amber-500/50 text-amber-300 font-extrabold';
    if (ball === 4) return 'bg-indigo-500/25 border-indigo-500/50 text-indigo-300 font-bold';
    if (ball === 0) return 'bg-slate-700/30 border-slate-700/50 text-slate-400';
    return 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300';
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 glow-indigo relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>

      {/* Top Banner: Status & User Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 font-outfit">LIVE MATCH COMPANION</span>
          <span className="text-xs text-slate-500 font-medium">|</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">IPL PLAYOFF DECIDER</span>
        </div>

        {/* User Info Bar */}
        {username && (
          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200 font-outfit">{username}</span>
              <span className="text-xs bg-indigo-500/25 text-indigo-300 px-2 py-0.2 rounded-full font-bold">
                {userTeam} Fan
              </span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="text-sm">
              <span className="text-slate-400">Tokens:</span> <span className="font-bold text-amber-400 font-mono">{userPoints}</span>
            </div>
          </div>
        )}
      </div>

      {/* Match Score & Teams Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Teams & Scorecard */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row justify-between items-center sm:items-stretch gap-6">
          <div className="flex items-center gap-4">
            {/* Team Badges */}
            <div className="flex -space-x-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getTeamGradient(battingTeam)} border-2 border-slate-900 flex items-center justify-center font-black text-xs shadow-lg font-outfit`}>
                {getTeamAbbr(battingTeam)}
              </div>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getTeamGradient(bowlingTeam)} border-2 border-slate-900 flex items-center justify-center font-black text-xs shadow-lg font-outfit`}>
                {getTeamAbbr(bowlingTeam)}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight flex items-baseline gap-2">
                <span>{runs}/{wickets}</span>
                <span className="text-sm font-medium text-slate-400">in {overs} ov</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <strong className="text-slate-200">{target}</strong> ({requiredRuns} needed of {ballsRemaining} balls)
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col justify-center sm:justify-start items-center sm:items-end gap-6 sm:gap-1 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-xs text-slate-400 block font-outfit">CRR</span>
              <strong className="text-base text-slate-200 font-mono">{crr}</strong>
            </div>
            <div className="hidden sm:block h-px w-8 bg-white/5 my-1"></div>
            <div>
              <span className="text-xs text-indigo-400 block font-outfit">RRR</span>
              <strong className="text-base text-indigo-300 font-mono">{rrr}</strong>
            </div>
          </div>
        </div>

        {/* Batsmen & Bowler Details */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6 grid grid-cols-2 gap-4">
          {/* Batsmen List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-outfit">Batting</h4>
            <div className="space-y-1.5">
              {Object.keys(batsmen).map((name) => {
                const bat = batsmen[name];
                if (!bat.active) return null;
                const isStriker = name === currentBatsman;
                return (
                  <div key={name} className={`flex justify-between items-center text-xs p-1 px-2 rounded-lg ${isStriker ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'}`}>
                    <span className="truncate max-w-[100px]">{name}{isStriker ? '*' : ''}</span>
                    <span className="font-mono">{bat.runs}({bat.balls})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bowler Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-outfit">Bowling</h4>
            <div className="space-y-1.5">
              {Object.keys(bowlers).map((name) => {
                const bowl = bowlers[name];
                const isCurrent = name === currentBowler;
                if (!isCurrent) return null;
                return (
                  <div key={name} className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 text-xs p-1 px-2 rounded-lg font-bold">
                    <div className="truncate max-w-[120px]">{name}</div>
                    <div className="flex justify-between font-mono text-[10px] mt-1 text-emerald-400/80">
                      <span>Overs: {bowl.overs}</span>
                      <span>W: {bowl.wickets} R: {bowl.runs}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="w-full mt-6 bg-slate-800/40 h-2 rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${targetPercent}%` }}
        ></div>
      </div>

      {/* Over History Timeline */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">This Over:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {currentOverHistory.length === 0 ? (
            <span className="text-xs text-slate-500 font-mono italic">Waiting for bowler's runup...</span>
          ) : (
            currentOverHistory.map((ball, idx) => (
              <span 
                key={idx} 
                className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono shadow-sm transition-transform duration-300 hover:scale-115 ${getBallBadgeClass(ball)}`}
              >
                {ball}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
