// frontend/src/components/CopilotChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Vote, Laugh, Sparkles, RefreshCw } from 'lucide-react';

export default function CopilotChat({
  socket,
  joinedGame,
  copilotChat,
  copilotTyping,
  poll,
  pollVotedOption,
  activeMeme
}) {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'copilot',
      text: "👋 Ayo! I am your **CricAI Copilot**! I'm synced in with the live match and pitch analytics. Ask me anything about the strategy, win projections, bowler setups, or rules!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  // Sync incoming copilot replies
  useEffect(() => {
    if (copilotChat) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: copilotChat.reply,
          time: copilotChat.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [copilotChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, copilotTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Append user message
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'user',
        text: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    socket.emit('ask-copilot', query);
    setQuery('');
  };

  const handleQuickQuestion = (qText) => {
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'user',
        text: qText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    socket.emit('ask-copilot', qText);
  };

  const handlePollVote = (idx) => {
    if (pollVotedOption !== null || poll?.hasVoted) return;
    socket.emit('vote-poll', idx);
  };

  const getPollTotalVotes = () => {
    if (!poll?.votes) return 0;
    return poll.votes.reduce((a, b) => a + b, 0);
  };

  const getPollPercentage = (votes) => {
    const total = getPollTotalVotes();
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const quickPrompts = [
    { text: "📊 Win probability?", icon: "📊" },
    { text: "🏏 Virat Kohli T20 stats?", icon: "🏏" },
    { text: "💡 Suggest strategic bet", icon: "💡" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* CricAI Strategy Copilot Chat */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-5 glow-indigo flex flex-col justify-between h-[520px]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold font-outfit text-slate-200">CricAI Match Copilot</h3>
          </div>
          <span className="text-[10px] bg-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 font-mono">
            <Sparkles className="w-2.5 h-2.5" /> GEMINI POWERED
          </span>
        </div>

        {/* Chat Logs Window */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-3 scrollbar-thin">
          {chatLog.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div 
                className={`p-3 rounded-2xl text-xs sm:text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-900/50 border border-white/5 text-slate-300 rounded-bl-none'
                }`}
              >
                {/* Format basic bold syntax in local message */}
                {msg.text.split('**').map((chunk, i) => 
                  i % 2 === 1 ? <strong key={i} className="text-white font-extrabold">{chunk}</strong> : chunk
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {copilotTyping && (
            <div className="flex flex-col items-start max-w-[80%]">
              <div className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Copilot is studying stadium data...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Click Prompts */}
        <div className="flex flex-wrap gap-2 mb-3 border-t border-white/5 pt-3">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(p.text.substring(2))}
              className="text-[10px] bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-all"
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask strategical questions (e.g. 'explain CRR target')..."
            className="flex-grow glass-input rounded-xl px-4 py-2.5 text-xs text-slate-200"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2.5 px-4 shadow flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Fan Engagement Box: Polls & Meme Cards */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 h-[520px]">
        {/* A. Live Context Poll */}
        <div className="glass-panel rounded-3xl p-5 glow-indigo flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
              <Vote className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold font-outfit text-slate-300 uppercase">Live Fan Poll</h4>
            </div>

            <h5 className="text-xs font-semibold text-slate-200 mb-3 leading-relaxed">
              {poll?.question || "Will the batting side hit a boundary in the next three balls?"}
            </h5>

            {/* Poll Options */}
            <div className="space-y-2">
              {poll?.options?.map((opt, idx) => {
                const totalVotes = getPollTotalVotes();
                const count = poll.votes?.[idx] || 0;
                const percent = getPollPercentage(count);
                const hasVoted = pollVotedOption !== null || poll.hasVoted;
                const userVotedForThis = pollVotedOption === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handlePollVote(idx)}
                    disabled={hasVoted}
                    className={`w-full text-left rounded-xl border text-xs p-2.5 relative overflow-hidden transition-all ${
                      hasVoted 
                        ? 'border-white/5 bg-slate-900/10 cursor-default' 
                        : 'border-white/5 bg-slate-900/30 hover:bg-slate-900/50 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Background Progress Slider */}
                    {hasVoted && (
                      <div 
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ${
                          userVotedForThis ? 'bg-indigo-600/15' : 'bg-slate-800/30'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    )}

                    <div className="relative flex justify-between items-center w-full">
                      <span className={`font-medium ${userVotedForThis ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                        {opt} {userVotedForThis && '✨'}
                      </span>
                      {hasVoted && (
                        <span className="font-mono font-bold text-slate-400">{percent}% ({count})</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-slate-500 text-center italic mt-2">
            Vote to earn bonus fan points. Results update immediately across all active screens!
          </p>
        </div>

        {/* B. Live Cricket Meme Card */}
        <div className="glass-panel rounded-3xl p-5 glow-indigo flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl animate-pulse"></div>
          
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <Laugh className="w-4 h-4 text-indigo-400 animate-bounce" />
            <h4 className="text-xs font-bold font-outfit text-slate-300 uppercase">Stadium Meme Hub</h4>
          </div>

          {/* Meme Comic Layout */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-indigo-300 whitespace-pre-line relative">
            <div className="absolute -top-1 -right-1 text-xs">💬</div>
            {activeMeme || "Awaiting match event dramatics...\n(A massive boundary or wicket will generate an automated AI cricket meme!)"}
          </div>

          <div className="flex justify-between items-center mt-2.5 text-[8px] text-slate-500 font-mono uppercase tracking-wider">
            <span>Context-Aware Joke</span>
            <span>Meme Lord AI v1.0</span>
          </div>
        </div>

      </div>

    </div>
  );
}
