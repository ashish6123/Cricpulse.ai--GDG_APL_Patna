// frontend/src/components/AgentThoughts.jsx
import React, { useEffect, useRef } from 'react';
import { Terminal, Sparkles, Cpu } from 'lucide-react';

export default function AgentThoughts({ agentThoughts }) {
  const terminalEndRef = useRef(null);

  // Auto-scroll to bottom of terminal when new thoughts arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentThoughts]);

  const getAgentColor = (agent) => {
    if (agent.includes('Tactical')) return 'text-indigo-400 font-bold';
    if (agent.includes('Hype')) return 'text-rose-400 font-bold';
    if (agent.includes('Meme')) return 'text-purple-400 font-bold';
    if (agent.includes('Pulse')) return 'text-emerald-400 font-bold';
    return 'text-amber-400 font-bold'; // Newsroom
  };

  const getAgentPrefix = (agent) => {
    if (agent.includes('Tactical')) return '🧠 TACTICAL_STRATEGIST_BOT:';
    if (agent.includes('Hype')) return '🎙️ EMOTIONAL_HYPER_CASTER:';
    if (agent.includes('Meme')) return '🤡 POP_CULTURE_MEME_LORD:';
    if (agent.includes('Pulse')) return '📊 CROWD_PULSE_MONITOR:';
    return '📰 NEWSROOM_CHIEF_WRITER:';
  };

  return (
    <div className="glass-panel rounded-3xl p-5 glow-indigo flex flex-col gap-4 relative overflow-hidden h-[360px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold font-outfit text-slate-200">CricAI Agent Collaboration Hub</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          <Cpu className="w-3 h-3 text-indigo-400 animate-spin" />
          <span className="text-[8px] font-bold text-indigo-400 font-mono tracking-widest uppercase">Orchestrator Active</span>
        </div>
      </div>

      {/* Mock Terminal Shell */}
      <div className="flex-grow bg-slate-950/80 border border-white/5 rounded-2xl p-4 font-mono text-[10px] sm:text-xs leading-relaxed overflow-y-auto space-y-3 relative shadow-inner">
        {/* Terminal Header OS Dots */}
        <div className="absolute top-3 right-4 flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
        </div>

        {/* Default Startup Text */}
        <div className="text-slate-500 italic pb-1">
          &gt; CricPulse multi-agent communication channel initialized...<br/>
          &gt; Satellites connected to Melbourne Cricket Ground...<br/>
          &gt; Listening for ball outcomes...
        </div>

        {/* Dynamic Agent Thoughts */}
        {(!agentThoughts || agentThoughts.length === 0) ? (
          <div className="text-indigo-400/50 italic animate-pulse">
            &gt; Waiting for next delivery... Ready to synchronize neural models...
          </div>
        ) : (
          <div className="space-y-2.5">
            {agentThoughts.map((item, idx) => (
              <div key={idx} className="border-l-2 border-white/5 pl-2.5 space-y-0.5 hover:bg-slate-900/10 transition-colors">
                <span className={getAgentColor(item.agent)}>
                  {getAgentPrefix(item.agent)}
                </span>
                <p className="text-slate-300 pl-4">{item.thought}</p>
              </div>
            ))}
            
            {/* Active typing prompt cursor */}
            <div className="flex items-center gap-1.5 text-indigo-400 pt-2 border-t border-white/5">
              <span className="animate-pulse">●</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500">
                All 5 agents converged. Dispatching payloads to live dashboard...
              </span>
              <span className="animate-ping font-bold">_</span>
            </div>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
        <span>Prompt Context: T20 Run Chase Setup</span>
        <span className="flex items-center gap-1 text-indigo-400/80">
          <Sparkles className="w-3 h-3" /> Multi-Agent Convergence
        </span>
      </div>

    </div>
  );
}
