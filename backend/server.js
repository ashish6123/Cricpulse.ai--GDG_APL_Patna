// backend/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import simulation from './simulation.js';
import * as aiService from './aiService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// LIVE CRICKET API INTEGRATION
// Polls cricketdata.org free tier for real live matches
// Falls back gracefully if no API key is set
// ----------------------------------------------------

let cachedLiveMatches = [];

const fetchLiveMatches = async () => {
  const apiKey = process.env.CRICKET_API_KEY;
  if (!apiKey) return; // No key = simulation mode only
  try {
    const url = `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`;
    const resp = await fetch(url);
    const json = await resp.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      cachedLiveMatches = json.data
        .filter(m => m.matchStarted && !m.matchEnded)
        .map(m => ({
          id: m.id,
          name: m.name,
          status: m.status,
          venue: m.venue,
          teams: m.teams,
          score: m.score || [],
          matchType: m.matchType
        }));
      if (io) io.emit('live-matches-update', cachedLiveMatches);
    }
  } catch (err) {
    // Silently fail — simulation mode continues
  }
};

// Poll every 60 seconds
setInterval(fetchLiveMatches, 60000);
fetchLiveMatches(); // Initial fetch on boot

// REST endpoint so frontend can list live matches
app.get('/api/live-matches', (req, res) => {
  res.json({ matches: cachedLiveMatches, simMode: !process.env.CRICKET_API_KEY });
});

// Health check for GCP Cloud Run
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Safe dev defaults
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// STATE VARIABLES
// ----------------------------------------------------

let autoPlayActive = false;
let autoPlayInterval = 14000; // 14 seconds per ball to allow predictions
let timerId = null;
let currentCountdown = 0;
let countdownIntervalId = null;

// User database & Leaderboard
const leaderboard = [
  { username: "KohliRizzler", points: 1250, team: "RCB", rank: 1, isBot: true },
  { username: "DhoniFinisher", points: 1100, team: "CSK", rank: 2, isBot: true },
  { username: "PatidarPower", points: 1050, team: "RCB", rank: 3, isBot: true },
  { username: "JaduSwordPlay", points: 950, team: "CSK", rank: 4, isBot: true },
  { username: "ChinnaswamyGeek", points: 800, team: "RCB", rank: 5, isBot: true }
];

const activeUsers = new Map(); // socket.id -> { username, points: 1000, team, predictions: {} }
const activePredictions = new Map(); // socket.id -> { choice, pointsBet }

// Poll vote counts
let currentPollVotes = {
  question: "Will the next over yield more than 10 runs?",
  options: ["Yes, easily!", "No, tight bowling", "Exactly 10 runs", "Wicket will fall"],
  votes: [12, 18, 5, 8],
  votedUsers: new Set() // Track socket IDs who voted
};

// ----------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------

const getSortedLeaderboard = () => {
  const allUsers = [...leaderboard];
  activeUsers.forEach((user) => {
    allUsers.push({
      username: user.username,
      points: user.points,
      team: user.team,
      isBot: false
    });
  });

  return allUsers
    .sort((a, b) => b.points - a.points)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
};

const triggerCountdown = () => {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  currentCountdown = 10; // 10 seconds betting countdown
  io.emit('countdown-tick', currentCountdown);

  countdownIntervalId = setInterval(() => {
    currentCountdown--;
    if (currentCountdown <= 0) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      // Resolve prediction and fetch next ball automatically if auto-play is enabled
      if (autoPlayActive) {
        processBallOutcome();
      }
    } else {
      io.emit('countdown-tick', currentCountdown);
    }
  }, 1000);
};

const resolvePredictions = (ball) => {
  const isWicket = ball.wicket !== null;
  const runs = ball.runs;

  let outcomeCategory = 'dot'; // 'dot', 'single', 'boundary', 'wicket'
  if (isWicket) {
    outcomeCategory = 'wicket';
  } else if (runs === 4 || runs === 6) {
    outcomeCategory = 'boundary';
  } else if (runs >= 1 && runs <= 3) {
    outcomeCategory = 'single';
  }

  // Payout multipliers
  const multipliers = {
    dot: 1.5,
    single: 2.0,
    boundary: 4.0,
    wicket: 8.0
  };

  const results = [];

  // Update human players
  activePredictions.forEach((pred, socketId) => {
    const user = activeUsers.get(socketId);
    if (!user) return;

    const correct = pred.choice === outcomeCategory;
    const bet = pred.pointsBet || 100;
    let netGain = 0;

    if (correct) {
      netGain = Math.round(bet * multipliers[outcomeCategory]);
      user.points += netGain;
    } else {
      netGain = -bet;
      user.points = Math.max(0, user.points - bet);
    }

    results.push({
      socketId,
      username: user.username,
      choice: pred.choice,
      correct,
      gain: netGain,
      newPoints: user.points
    });

    // Send individual update to client
    io.to(socketId).emit('prediction-result', {
      choice: pred.choice,
      correct,
      gain: netGain,
      points: user.points
    });
  });

  // Clear active predictions
  activePredictions.clear();

  // Dynamically update some bots for fun realism
  leaderboard.forEach(bot => {
    const coin = Math.random();
    if (coin > 0.6) {
      // Correct prediction
      bot.points += Math.round(50 + Math.random() * 100);
    } else {
      // Loss
      bot.points = Math.max(200, bot.points - 50);
    }
  });

  return results;
};

// Helper to procedural-generate collaborative AI Agent Thoughts for the terminal UI
const generateAgentThoughts = (ball, state) => {
  const isWicket = ball.wicket !== null;
  const runs = ball.runs;
  
  if (isWicket) {
    return [
      { agent: "🧠 Tactical Strategist", thought: `Bowler ${ball.bowler} pitched a heavy blockhole yorker. Batsman ${ball.wicket.player} failed to defend strike line. Optimal setup executed.` },
      { agent: "🎙️ Hype & Emotion", thought: `CRITICAL WICKET! Stadium noise peaked at 99 dB! Fan anxiety logged. Transitioning commentary persona to high-drama cinematic framing.` },
      { agent: "🤡 Pop Culture Meme", thought: `Wicket detected. Bro got sent back to the dugout faster than my crypto portfolio dips. Meme card dispatched.` },
      { agent: "📊 Crowd Pulse", thought: `Crowd tension hit 88%. Dispensing urgent sentiment poll: 'Can the new batsman survive Pathirana's heat?'` },
      { agent: "📰 Newsroom Chief", thought: `Breaking news story drafted: 'DISASTER FOR RCB!' and scheduled Twitter campaign.` }
    ];
  } else if (runs === 6) {
    return [
      { agent: "🧠 Tactical Strategist", thought: `Short pitched slower tracker detected. ${ball.batsman} transferred weight and cleared long-on deep boundary. Master timing.` },
      { agent: "🎙️ Hype & Emotion", thought: `TOWERING SIX! Adrenaline spike index at 100%! Initiating caps-lock shout commentaries for Hype persona!` },
      { agent: "🤡 Pop Culture Meme", thought: `That ball didn't just cross the ropes, it got high-altitude clearance from local aviation. Bowler got absolutely ratioed.` },
      { agent: "📊 Crowd Pulse", thought: `Win probability surged by 15%! Generating high-hype poll: 'Will the next ball clear the stadium ropes as well?'` },
      { agent: "📰 Newsroom Chief", thought: `Drafted viral Twitter package under #KingKohli and pushed breaking article to live timeline.` }
    ];
  } else if (runs === 4) {
    return [
      { agent: "🧠 Tactical Strategist", thought: `Overpitched outswinger met with clean cover-drive. Notice high front elbow. Neutralized lateral movement off turf.` },
      { agent: "🎙️ Hype & Emotion", thought: `GORGEOUS COVER DRIVE! Boundary wave is rolling! Pushing energetic tempos to GenZ and Hype commentary layers.` },
      { agent: "🤡 Pop Culture Meme", thought: `The CSK fielder ran after that ball like he was chasing a bus that left 5 minutes ago. Easy boundary.` },
      { agent: "📊 Crowd Pulse", thought: `Confidence index high. Pushing bonus fan sentiment points poll options.` },
      { agent: "📰 Newsroom Chief", thought: `Newsroom timeline received boundary recap article. Social drafts set to pending.` }
    ];
  } else if (runs === 0) {
    return [
      { agent: "🧠 Tactical Strategist", thought: `Good length seamer beats outside edge. Bowler targeting corridors of uncertainty. Batsman defensive block failed to locate runs.` },
      { agent: "🎙️ Hype & Emotion", thought: `Stifled appeal! The tension in the stadium is so thick you could slice it. Keeps commentary dramatic.` },
      { agent: "🤡 Pop Culture Meme", thought: `Batsman swung at that like he was fighting off a swarm of angry bees. Absolute dot ball. We sleep.` },
      { agent: "📊 Crowd Pulse", thought: `Required rate climbing. Tension index up. Live poll: 'Will batsman hit a boundary in the next 3 balls?'` },
      { agent: "📰 Newsroom Chief", thought: `Drafted dot-ball defensive containment summary and pushed tweet draft.` }
    ];
  } else {
    return [
      { agent: "🧠 Tactical Strategist", thought: `Nudge to mid-wicket. Strike rotated efficiently. Keeping RRR stable and keeping key set batsman on strike.` },
      { agent: "🎙️ Hype & Emotion", thought: `Quiet single. Stadium decibels resting at 80dB. commentary tempos set to analytical and warm pacing.` },
      { agent: "🤡 Pop Culture Meme", thought: `Taps and runs. Moving faster than me running away from my student loans and responsibilities.` },
      { agent: "📊 Crowd Pulse", thought: `Scoreboard ticking. Fan sentiment holding steady. Poll options kept stable.` },
      { agent: "📰 Newsroom Chief", thought: `Rotating news timeline feeds. Pushed strike rotation social post.` }
    ];
  }
};

// Main ball generation, AI querying, and Socket broadcasting
async function processBallOutcome() {
  io.emit('loading-next-ball', true);

  const { ended, ball, state } = simulation.processNextBall();

  if (ended) {
    autoPlayActive = false;
    if (timerId) clearTimeout(timerId);
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    io.emit('match-ended', state);
    io.emit('loading-next-ball', false);
    return;
  }

  // Resolve prediction arena
  resolvePredictions(ball);

  // Run AI agents in parallel (high-performance concurrency)
  try {
    const [commentaries, newsroom, engagement] = await Promise.all([
      // 1. Generate multi-personality commentary
      Promise.all([
        aiService.generateCommentary(ball, state, 'hype'),
        aiService.generateCommentary(ball, state, 'tactical'),
        aiService.generateCommentary(ball, state, 'meme'),
        aiService.generateCommentary(ball, state, 'genz'),
        aiService.generateCommentary(ball, state, 'cinematic')
      ]).then(([hype, tactical, meme, genz, cinematic]) => ({
        hype, tactical, meme, genz, cinematic
      })),

      // 2. AI Newsroom Agent (only on big moments: four, six, wickets, or end)
      (ball.runs === 4 || ball.runs === 6 || ball.wicket !== null || state.runs >= state.target)
        ? aiService.generateNewsroomContent(ball, state)
        : Promise.resolve(null),

      // 3. AI Dynamic Polls and Meme Hub
      aiService.generatePollAndMeme(ball, state)
    ]);

    // Update the active poll with new AI question
    if (engagement && engagement.poll) {
      currentPollVotes = {
        question: engagement.poll.question,
        options: engagement.poll.options,
        votes: [0, 0, 0, 0],
        votedUsers: new Set()
      };
    }

    const payload = {
      ball,
      matchState: state,
      commentaries,
      newsroom,
      engagement,
      agentThoughts: generateAgentThoughts(ball, state),
      leaderboard: getSortedLeaderboard()
    };

    io.emit('new-ball-update', payload);
  } catch (error) {
    console.error("Failed to generate complete AI package:", error);
  } finally {
    io.emit('loading-next-ball', false);
  }

  // Restart prediction countdown if match is still running
  if (state.ballsRemaining > 0 && state.runs < state.target && state.wickets < 10) {
    triggerCountdown();
    // Schedule next automatic ball if autoplay is active
    if (autoPlayActive) {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(processBallOutcome, autoPlayInterval);
    }
  } else {
    io.emit('match-ended', state);
  }
}


// ----------------------------------------------------
// SOCKET CONNECTION HANDLERS
// ----------------------------------------------------

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send initial state to the joining client
  socket.emit('initial-state', {
    matchState: simulation.getCurrentState(),
    leaderboard: getSortedLeaderboard(),
    autoPlayActive,
    poll: {
      question: currentPollVotes.question,
      options: currentPollVotes.options,
      votes: currentPollVotes.votes,
      hasVoted: false
    }
  });

  // User joins the Predictor Arena
  socket.on('join-game', (data) => {
    // data: { username, team }
    const username = data.username || `Fan_${socket.id.substring(0, 5)}`;
    const team = data.team || "RCB";

    activeUsers.set(socket.id, {
      username,
      points: 1000,
      team,
      joinedAt: Date.now()
    });

    console.log(`User ${username} joined represent team ${team}`);

    // Push new leaderboard
    io.emit('leaderboard-update', getSortedLeaderboard());
    socket.emit('join-success', { username, points: 1000, team });
  });

  // User places prediction
  socket.on('place-prediction', (data) => {
    // data: { choice: 'dot'|'single'|'boundary'|'wicket', pointsBet }
    if (!activeUsers.has(socket.id)) {
      return socket.emit('error-msg', 'Please set your username first.');
    }
    if (currentCountdown <= 0) {
      return socket.emit('error-msg', 'Predictions are closed for this ball.');
    }

    const user = activeUsers.get(socket.id);
    const bet = Math.max(10, Math.min(user.points, data.pointsBet || 100));

    activePredictions.set(socket.id, {
      choice: data.choice,
      pointsBet: bet
    });

    socket.emit('prediction-placed', { choice: data.choice, pointsBet: bet });
    console.log(`[Prediction] ${user.username} bet ${bet} on ${data.choice}`);
  });

  // CricAI Copilot Q&A handler
  socket.on('ask-copilot', async (query) => {
    if (!query || query.trim() === '') return;

    socket.emit('copilot-typing', true);
    const state = simulation.getCurrentState();
    const user = activeUsers.get(socket.id);
    const favTeam = user ? user.team : 'RCB';

    try {
      const reply = await aiService.generateCricCopilotResponse(query, state, favTeam);
      socket.emit('copilot-reply', {
        query,
        reply,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      console.error(e);
      socket.emit('copilot-reply', {
        query,
        reply: "Apologies, stadium interference has temporarily cut my feed. Ask me again shortly!",
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      socket.emit('copilot-typing', false);
    }
  });


  // User votes in the live poll
  socket.on('vote-poll', (optionIdx) => {
    if (currentPollVotes.votedUsers.has(socket.id)) {
      return socket.emit('error-msg', 'You have already voted in this poll.');
    }

    if (optionIdx >= 0 && optionIdx < currentPollVotes.votes.length) {
      currentPollVotes.votes[optionIdx] += 1;
      currentPollVotes.votedUsers.add(socket.id);

      io.emit('poll-update', {
        question: currentPollVotes.question,
        options: currentPollVotes.options,
        votes: currentPollVotes.votes
      });

      socket.emit('vote-success', optionIdx);
    }
  });

  // ----------------------------------------------------
  // ADMIN CONTROL PANEL HANDLERS (Manual Simulation)
  // ----------------------------------------------------

  socket.on('admin-toggle-autoplay', (status) => {
    autoPlayActive = status;
    io.emit('autoplay-status', autoPlayActive);

    if (autoPlayActive) {
      console.log('Admin started Auto-Play Loop');
      triggerCountdown();
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(processBallOutcome, autoPlayInterval);
    } else {
      console.log('Admin paused Auto-Play Loop');
      if (timerId) clearTimeout(timerId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);
      timerId = null;
      countdownIntervalId = null;
      io.emit('countdown-tick', 0);
    }
  });

  socket.on('admin-trigger-ball', (customEvent) => {
    // customEvent: { runs: 6, wicket: null, batsman, bowler, type, speed }
    console.log('Admin triggered manual ball event:', customEvent);
    if (timerId) clearTimeout(timerId);
    if (countdownIntervalId) clearInterval(countdownIntervalId);

    simulation.queueCustomBall(customEvent);
    processBallOutcome();
  });

  socket.on('admin-reset', () => {
    console.log('Admin reset the match simulation');
    simulation.reset();
    activePredictions.clear();

    // Reset bot scores
    leaderboard[0].points = 1250;
    leaderboard[1].points = 1100;
    leaderboard[2].points = 1050;
    leaderboard[3].points = 950;
    leaderboard[4].points = 800;

    // Reset human scores
    activeUsers.forEach(user => {
      user.points = 1000;
    });
    currentPollVotes = {
      question: "Who will win this high-stakes over?",
      options: ["RCB (Red Army)", "CSK (Yellow Brigade)", "Both (Balanced Over)", "Draw/Super Over!"],
      votes: [0, 0, 0, 0],
      votedUsers: new Set()
    };

    io.emit('match-reset', {
      matchState: simulation.getCurrentState(),
      leaderboard: getSortedLeaderboard(),
      poll: {
        question: currentPollVotes.question,
        options: currentPollVotes.options,
        votes: currentPollVotes.votes
      }
    });

    if (autoPlayActive) {
      triggerCountdown();
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(processBallOutcome, autoPlayInterval);
    } else {
      io.emit('countdown-tick', 0);
    }
  });

  socket.on('admin-initialize-match', (setup) => {
    console.log('Admin initializing dynamic match setup:', setup);
    if (timerId) clearTimeout(timerId);
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    
    simulation.initializeMatch(setup);
    activePredictions.clear();
    
    const state = simulation.getCurrentState();
    
    currentPollVotes = {
      question: `Who will dominate the opening overs of this ${state.battingTeam} vs ${state.bowlingTeam} clash?`,
      options: [`${state.battingTeam} Top Order`, `${state.bowlingTeam} Pace Attack`, "Balanced runs & wickets", "Highly volatile chaos"],
      votes: [0, 0, 0, 0],
      votedUsers: new Set()
    };

    io.emit('new-ball-update', {
      ball: {
        over: state.overs,
        batsman: state.currentBatsman,
        bowler: state.currentBowler,
        runs: 0,
        wicket: null,
        ballSpeed: "0.0 km/h",
        ballType: "Match Initialized",
        commentarySeed: `Live match initialized: ${state.battingTeam} vs ${state.bowlingTeam}!`,
        winProbability: state.winProbability,
        momentum: state.momentum,
        hypeLevel: state.hypeLevel
      },
      matchState: state,
      commentaries: {
        hype: `WELCOME TO THE LIVE BROADCAST OF ${state.battingTeam} VS ${state.bowlingTeam}! THE ATMOSPHERE IS ABSOLUTELY CHARGED! READY FOR LAUNCH!`,
        tactical: `Tactical analysis system initialized for ${state.battingTeam} vs ${state.bowlingTeam}. Live coordinate feeds and radar tracks are now syncing...`,
        meme: `Match loaded: ${state.battingTeam} vs ${state.bowlingTeam}. Popcorn stands are fully stocked. Let the complete chaos begin!`,
        genz: `OMG a new match just dropped: ${state.battingTeam} vs ${state.bowlingTeam}! It is literally giving absolute main character energy, fr fr! 💅`,
        cinematic: `Under the floodlights of the great colosseum, the titans of ${state.battingTeam} and ${state.bowlingTeam} gather. A battle of historical destiny begins!`
      },
      newsroom: {
        headline: `LIVE BROADCAST: ${state.battingTeam} VS ${state.bowlingTeam} SYNCHRONIZED!`,
        article: `The cricket world turns its attention to this monumental clash between ${state.battingTeam} and ${state.bowlingTeam}. Both teams are locking horns in a live battle that will define their standings. Fans are swarming the arena with colors flying high.`,
        socialPost: `🚨 LIVE MATCH SYNCED! The battle between ${state.battingTeam} and ${state.bowlingTeam} is now active in the CricPulse Arena! Place your strategic predictions now! 🏆🔥 #CricketLive #CricPulse`
      },
      engagement: {
        poll: {
          question: currentPollVotes.question,
          options: currentPollVotes.options
        },
        meme: `${state.battingTeam} fans preparing their math calculators.\n${state.bowlingTeam} fans preparing their vocal cords.`
      },
      leaderboard: getSortedLeaderboard()
    });

    if (autoPlayActive) {
      triggerCountdown();
      timerId = setTimeout(processBallOutcome, autoPlayInterval);
    } else {
      io.emit('countdown-tick', 0);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    activeUsers.delete(socket.id);
    activePredictions.delete(socket.id);
    io.emit('leaderboard-update', getSortedLeaderboard());
  });
});

// Start listening
server.listen(PORT, () => {
  console.log(`CricPulse Express Server running on port ${PORT}`);
});
