// frontend/src/components/NewsroomAgent.jsx
import React from 'react';
import { Newspaper, Rss, Share2, ThumbsUp } from 'lucide-react';


export default function NewsroomAgent({ newsTimeline }) {
  return (
    <div className="glass-panel rounded-3xl p-6 glow-indigo relative overflow-hidden">
      {/* Background highlight */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/5 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold font-outfit text-slate-200">AI Sports Newsroom Agent</h3>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-wider uppercase">Agent Active</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        Our autonomous AI Agent is listening to the match feed, detecting high-leverage wickets or game-changing boundaries, and drafting articles, headlines, and viral tweets!
      </p>

      {/* News timeline feed */}
      {newsTimeline.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-slate-900/10 space-y-2">
          <Rss className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
          <p className="text-xs text-slate-500 italic">
            Waiting for a key match moment to occur...
          </p>
          <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
            (Hint: In autoplay, watch over 16.2 or 16.4. You can also manually trigger a Six or Wicket using the Admin Panel!)
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {newsTimeline.map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden hover:border-indigo-500/20 transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>

              {/* Timestamp & Meta */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono uppercase mb-2">
                <span>Breaking News • Over {item.over}</span>
                <span>Auto-Generated</span>
              </div>

              {/* Headline */}
              <h4 className="text-sm sm:text-base font-extrabold text-indigo-300 font-outfit mb-3 group-hover:text-white transition-colors">
                📰 {item.headline}
              </h4>

              {/* Article content */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4 pb-4 border-b border-white/5">
                {item.article}
              </p>

              {/* Mock Social Tweet */}
              <div className="bg-slate-950/70 border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  {/* Twitter avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                    CP
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-bold text-slate-200">CricPulse AI Sportsroom</span>
                      <span className="text-[9px] bg-indigo-500/25 text-indigo-400 px-1 py-0.2 rounded font-mono font-bold">Bot</span>
                    </div>
                    <span className="text-[9px] text-slate-500">@cricpulse_agent</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-sky-400 ml-auto fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>

                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {item.socialPost}
                </p>

                {/* Tweet Interactions Mock */}
                <div className="flex gap-4 items-center pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> 842
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </span>
                  <span className="ml-auto text-[9px] bg-slate-900 px-2 py-0.5 border border-white/5 rounded text-indigo-400 font-bold uppercase tracking-wider">
                    Draft Generated
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
