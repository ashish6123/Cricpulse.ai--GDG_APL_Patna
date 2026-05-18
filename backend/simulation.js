// backend/simulation.js

const INITIAL_BATSMEN = {
  "Virat Kohli": { runs: 41, balls: 30, fours: 3, sixes: 1, active: true },
  "Glenn Maxwell": { runs: 12, balls: 8, fours: 1, sixes: 0, active: true },
  "Dinesh Karthik": { runs: 0, balls: 0, fours: 0, sixes: 0, active: false },
  "Rajat Patidar": { runs: 0, balls: 0, fours: 0, sixes: 0, active: false },
  "Faf du Plessis": { runs: 0, balls: 0, fours: 0, sixes: 0, active: false },
  "Cameron Green": { runs: 0, balls: 0, fours: 0, sixes: 0, active: false }
};

const INITIAL_BOWLERS = {
  "Matheesha Pathirana": { overs: 3.0, maidens: 0, runs: 28, wickets: 2 },
  "Ravindra Jadeja": { overs: 3.0, maidens: 0, runs: 32, wickets: 1 },
  "Shardul Thakur": { overs: 3.0, maidens: 0, runs: 24, wickets: 1 }
};

// Complete pre-scripted 30 balls of IPL Playoff Thriller (Overs 15.1 to 20.0)
const SCRIPTED_BALLS = [
  // --- OVER 16 (Matheesha Pathirana bowling, RCB needs 54 off 30) ---
  {
    over: "15.1", batsman: "Virat Kohli", bowler: "Matheesha Pathirana", runs: 1, wicket: null,
    ballSpeed: "148.4 km/h", ballType: "Good length outswinger",
    commentarySeed: "Kohli takes a step forward and pushes this slinging Pathirana delivery gently towards sweep cover for a single.",
    winProbability: { batting: 38, bowling: 62 }, momentum: -15, hypeLevel: 55
  },
  {
    over: "15.2", batsman: "Glenn Maxwell", bowler: "Matheesha Pathirana", runs: 4, wicket: null,
    ballSpeed: "142.9 km/h", ballType: "Leg-side half-volley",
    commentarySeed: "Maxwell stands tall and whips the slinging leg-side half-volley perfectly through backward square leg for a cracking FOUR!",
    winProbability: { batting: 44, bowling: 56 }, momentum: 10, hypeLevel: 80
  },
  {
    over: "15.3", batsman: "Glenn Maxwell", bowler: "Matheesha Pathirana", runs: 0, wicket: null,
    ballSpeed: "150.1 km/h", ballType: "Fast off-cutter yorker",
    commentarySeed: "Pathirana bounces back with a searing 150km/h slower off-cutter. Maxwell swings across the line, completely deceived. Dot ball.",
    winProbability: { batting: 40, bowling: 60 }, momentum: -5, hypeLevel: 65
  },
  {
    over: "15.4", batsman: "Glenn Maxwell", bowler: "Matheesha Pathirana", runs: 0,
    wicket: { player: "Glenn Maxwell", type: "Caught by MS Dhoni", description: "Tried to slice a wide blockhole ball. Thick edge, Dhoni dives full length to his right to grab a stunner!" },
    ballSpeed: "147.2 km/h", ballType: "Slinging bouncer outside off",
    commentarySeed: "WICKET! Unbelievable catch by MS Dhoni! Maxwell slices at a wide Pathirana bouncer, gets a thick edge, and Dhoni flies like a bird to grab it!",
    winProbability: { batting: 25, bowling: 75 }, momentum: -70, hypeLevel: 98
  },
  {
    over: "15.5", batsman: "Dinesh Karthik", bowler: "Matheesha Pathirana", runs: 1, wicket: null,
    ballSpeed: "138.4 km/h", ballType: "Inswinging length ball",
    commentarySeed: "Dinesh Karthik gets off the mark with a sensible glance to fine leg for a single. He looks calm under intense IPL pressure.",
    winProbability: { batting: 26, bowling: 74 }, momentum: -50, hypeLevel: 50
  },
  {
    over: "15.6", batsman: "Virat Kohli", bowler: "Matheesha Pathirana", runs: 1, wicket: null,
    ballSpeed: "149.8 km/h", ballType: "Full outside off",
    commentarySeed: "Kohli taps it towards backward point and scurries across for a quick run to retain strike. Over ends.",
    winProbability: { batting: 27, bowling: 73 }, momentum: -45, hypeLevel: 60
  },

  // --- OVER 17 (Ravindra Jadeja bowling, RCB needs 46 off 24) ---
  {
    over: "16.1", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 2, wicket: null,
    ballSpeed: "98.5 km/h", ballType: "Flat left-arm spinner",
    commentarySeed: "Kohli drives Jadeja's flat delivery towards deep mid-wicket. A fast, aggressive couple of runs showing unbelievable athletic fitness.",
    winProbability: { batting: 30, bowling: 70 }, momentum: -30, hypeLevel: 65
  },
  {
    over: "16.2", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 6, wicket: null,
    ballSpeed: "102.2 km/h", ballType: "Short indexing spinner",
    commentarySeed: "SIX! Sent into the Chinnaswamy roof! Jadeja pulls his length back, Kohli rocks back and strikes a legendary loft over deep mid-wicket!",
    winProbability: { batting: 45, bowling: 55 }, momentum: 50, hypeLevel: 96
  },
  {
    over: "16.3", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 1, wicket: null,
    ballSpeed: "96.0 km/h", ballType: "Flat delivery outside off",
    commentarySeed: "Sensible cricket. After a massive six, Kohli just taps this flat spinner to long-on for a comfortable single.",
    winProbability: { batting: 46, bowling: 54 }, momentum: 40, hypeLevel: 65
  },
  {
    over: "16.4", batsman: "Dinesh Karthik", bowler: "Ravindra Jadeja", runs: 0,
    wicket: { player: "Dinesh Karthik", type: "Bowled", description: "A rapid arm-ball seeping past the inside edge to rattle the off-stump. Masterclass spinner!" },
    ballSpeed: "104.7 km/h", ballType: "Rapid arm-ball",
    commentarySeed: "WICKET! Clean bowled by Jadeja! Karthik plays for the turn, but Jadeja fires a rapid arm-ball that goes straight on and shatters off-stump!",
    winProbability: { batting: 28, bowling: 72 }, momentum: -80, hypeLevel: 99
  },
  {
    over: "16.5", batsman: "Rajat Patidar", bowler: "Ravindra Jadeja", runs: 0, wicket: null,
    ballSpeed: "95.4 km/h", ballType: "Classical left-arm spinner",
    commentarySeed: "Patidar tries to defend but gets beaten by the sharp spin and extra bounce. Excellent dot ball from Jadeja.",
    winProbability: { batting: 25, bowling: 75 }, momentum: -75, hypeLevel: 75
  },
  {
    over: "16.6", batsman: "Rajat Patidar", bowler: "Ravindra Jadeja", runs: 1, wicket: null,
    ballSpeed: "97.2 km/h", ballType: "Flat ball on pads",
    commentarySeed: "Patidar works this off his pads down to deep square leg and steals a crucial run. 18 overs done.",
    winProbability: { batting: 26, bowling: 74 }, momentum: -65, hypeLevel: 60
  },

  // --- OVER 18 (Shardul Thakur bowling, RCB needs 36 off 18) ---
  {
    over: "17.1", batsman: "Rajat Patidar", bowler: "Shardul Thakur", runs: 1, wicket: null,
    ballSpeed: "135.8 km/h", ballType: "Length ball outside off",
    commentarySeed: "Patidar guides Shardul safely down to third man. A single gives Kohli back the strike. Strategic shift.",
    winProbability: { batting: 28, bowling: 72 }, momentum: -55, hypeLevel: 55
  },
  {
    over: "17.2", batsman: "Virat Kohli", bowler: "Shardul Thakur", runs: 4, wicket: null,
    ballSpeed: "138.1 km/h", ballType: "Overpitched outside off",
    commentarySeed: "FOUR! Classical cover drive from King Kohli! Shardul pitches it full and Kohli punches it beautifully through the covers!",
    winProbability: { batting: 38, bowling: 62 }, momentum: 20, hypeLevel: 88
  },
  {
    over: "17.3", batsman: "Virat Kohli", bowler: "Shardul Thakur", runs: 2, wicket: null,
    ballSpeed: "136.5 km/h", ballType: "Good length on off",
    commentarySeed: "Kohli drives to deep extra cover and pushes hard for the second run. Outstanding running under extreme IPL playoff pressure!",
    winProbability: { batting: 41, bowling: 59 }, momentum: 30, hypeLevel: 75
  },
  {
    over: "17.4", batsman: "Virat Kohli", bowler: "Shardul Thakur", runs: 6, wicket: null,
    ballSpeed: "139.4 km/h", ballType: "Full delivery straight",
    commentarySeed: "SIX! Stand and deliver! Kohli lofts Shardul high and straight over the sightscreen! A massive blow that sends RCB fans into absolute ecstasy!",
    winProbability: { batting: 60, bowling: 40 }, momentum: 80, hypeLevel: 98
  },
  {
    over: "17.5", batsman: "Virat Kohli", bowler: "Shardul Thakur", runs: 1, wicket: null,
    ballSpeed: "132.9 km/h", ballType: "Slower ball bouncer",
    commentarySeed: "Kohli waits and taps this clever slower bouncer gently to square leg for a single. Managing the chase perfectly.",
    winProbability: { batting: 62, bowling: 38 }, momentum: 70, hypeLevel: 65
  },
  {
    over: "17.6", batsman: "Rajat Patidar", bowler: "Shardul Thakur", runs: 0, wicket: null,
    ballSpeed: "141.0 km/h", ballType: "Inswinging yorker",
    commentarySeed: "Patidar is well-defensive against Shardul's yorker. Over finishes. RCB needs 22 off 12 balls.",
    winProbability: { batting: 58, bowling: 42 }, momentum: 60, hypeLevel: 70
  },

  // --- OVER 19 (Ravindra Jadeja bowling, RCB needs 22 off 12) ---
  {
    over: "18.1", batsman: "Rajat Patidar", bowler: "Ravindra Jadeja", runs: 1, wicket: null,
    ballSpeed: "96.8 km/h", ballType: "Length ball on pads",
    commentarySeed: "Patidar plays it off the thigh pad towards fine leg for a single. Kohli returns to strike.",
    winProbability: { batting: 60, bowling: 40 }, momentum: 55, hypeLevel: 65
  },
  {
    over: "18.2", batsman: "Rajat Patidar", bowler: "Ravindra Jadeja", runs: 0,
    wicket: { player: "Rajat Patidar", type: "Caught by Ruturaj Gaikwad", description: "Top-edged a desperate sweep shot. CSK captain Gaikwad takes a comfortable catch at deep mid-wicket." },
    ballSpeed: "99.2 km/h", ballType: "Rapid flat spinner",
    commentarySeed: "WICKET! Patidar tries to sweep Jadeja's flat ball, gets a high top-edge, and CSK captain Ruturaj Gaikwad takes a secure catch at deep mid-wicket!",
    winProbability: { batting: 45, bowling: 55 }, momentum: -60, hypeLevel: 94
  },
  {
    over: "18.3", batsman: "Faf du Plessis", bowler: "Ravindra Jadeja", runs: 1, wicket: null,
    ballSpeed: "94.5 km/h", ballType: "Outside off spinner",
    commentarySeed: "Faf swings, gets a thick outside edge that flies safely to deep third man for a single. Faf is on strike rotation.",
    winProbability: { batting: 44, bowling: 56 }, momentum: -40, hypeLevel: 65
  },
  {
    over: "18.4", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 4, wicket: null,
    ballSpeed: "98.9 km/h", ballType: "Low full toss outside off",
    commentarySeed: "FOUR! Stupendous! Kohli reaches out and slices Jadeja beautifully past backward point. The fielders stand frozen!",
    winProbability: { batting: 62, bowling: 38 }, momentum: 50, hypeLevel: 90
  },
  {
    over: "18.5", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 6, wicket: null,
    ballSpeed: "97.8 km/h", ballType: "Slower flat ball",
    commentarySeed: "SIX! Kohli does it again! He lofts Jadeja high over the straight ropes! A staggering blow that leaves Jadeja smiling in disbelief!",
    winProbability: { batting: 82, bowling: 18 }, momentum: 90, hypeLevel: 99
  },
  {
    over: "18.6", batsman: "Virat Kohli", bowler: "Ravindra Jadeja", runs: 2, wicket: null,
    ballSpeed: "99.2 km/h", ballType: "Full outside off",
    commentarySeed: "Kohli drives to deep extra cover. They run hard and secure an extraordinary second run! RCB needs 8 runs off the final over!",
    winProbability: { batting: 88, bowling: 12 }, momentum: 95, hypeLevel: 97
  },

  // --- OVER 20 (Matheesha Pathirana bowling, RCB needs 8 runs) ---
  {
    over: "19.1", batsman: "Faf du Plessis", bowler: "Matheesha Pathirana", runs: 1, wicket: null,
    ballSpeed: "148.0 km/h", ballType: "Leg-side slinging yorker (Leg bye)",
    commentarySeed: "Faf misses the flick, it strikes his pads and they scurry across for a leg bye single. 7 needed off 5 balls!",
    winProbability: { batting: 85, bowling: 15 }, momentum: 85, hypeLevel: 88
  },
  {
    over: "19.2", batsman: "Virat Kohli", bowler: "Matheesha Pathirana", runs: 2, wicket: null,
    ballSpeed: "149.5 km/h", ballType: "Full delivery on legs",
    commentarySeed: "Kohli whips Pathirana to deep extra cover, runs like a cheetah, and comfortably makes the double. 5 runs needed off 4 balls!",
    winProbability: { batting: 90, bowling: 10 }, momentum: 90, hypeLevel: 92
  },
  {
    over: "19.3", batsman: "Virat Kohli", bowler: "Matheesha Pathirana", runs: 0, wicket: null,
    ballSpeed: "151.9 km/h", ballType: "Fierce fast slinging yorker",
    commentarySeed: "Dot ball! An absolute blistering slinging yorker from Pathirana at 152 km/h. Kohli squeezes it out under immense tension.",
    winProbability: { batting: 78, bowling: 22 }, momentum: 50, hypeLevel: 85
  },
  {
    over: "19.4", batsman: "Virat Kohli", bowler: "Matheesha Pathirana", runs: 0,
    wicket: { player: "Virat Kohli", type: "Caught by Ruturaj Gaikwad", description: "Tried to loft over long-off but did not get full power. Gaikwad catches right at the boundary rope!" },
    ballSpeed: "147.7 km/h", ballType: "Slow off-cutter bouncer",
    commentarySeed: "WICKET! Unbelievable drama at Chinnaswamy! Kohli goes for the winning hit, but gets a top edge. Ruturaj Gaikwad takes a highly tense catch right at the boundary rope! The stadium is in silence!",
    winProbability: { batting: 45, bowling: 55 }, momentum: -90, hypeLevel: 100
  },
  {
    over: "19.5", batsman: "Cameron Green", bowler: "Matheesha Pathirana", runs: 4, wicket: null,
    ballSpeed: "143.4 km/h", ballType: "Full overpitched outside off",
    commentarySeed: "FOUR! Cameron Green is the hero! A full slingy ball outside off, Green drives it beautifully past mid-off! Scores are level! 1 run off 1 ball!",
    winProbability: { batting: 95, bowling: 5 }, momentum: 95, hypeLevel: 99
  },
  {
    over: "19.6", batsman: "Cameron Green", bowler: "Matheesha Pathirana", runs: 1, wicket: null,
    ballSpeed: "149.8 km/h", ballType: "Full straight yorker",
    commentarySeed: "SINGLE RUN! Green squeezes it to mid-wicket, Faf du Plessis sprints like crazy! They cross for a single, and RCB wins an absolute classic IPL Playoff by 1 wicket!",
    winProbability: { batting: 100, bowling: 0 }, momentum: 100, hypeLevel: 100
  }
];

class SimulationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentBallIndex = 0;
    this.customQueue = [];
    this.gameState = {
      battingTeam: "RCB",
      bowlingTeam: "CSK",
      target: 180,
      runs: 126,
      wickets: 5,
      overs: "15.0",
      totalBalls: 90, // 15 overs * 6
      requiredRuns: 54,
      ballsRemaining: 30,
      currentOverHistory: [],
      batsmen: JSON.parse(JSON.stringify(INITIAL_BATSMEN)),
      bowlers: JSON.parse(JSON.stringify(INITIAL_BOWLERS)),
      currentBatsman: "Virat Kohli",
      currentNonStriker: "Glenn Maxwell",
      currentBowler: "Matheesha Pathirana",
      winProbability: { batting: 38, bowling: 62 },
      momentum: -15, // -100 to +100
      hypeLevel: 65,
      history: []
    };
  }

  initializeMatch(setup) {
    this.currentBallIndex = 999; // Bypasses pre-scripted sequences
    this.customQueue = [];

    const striker    = setup.currentBatsman    || "Batter 1";
    const nonStriker = setup.currentNonStriker || "Batter 2";
    const bowler     = setup.currentBowler     || "Bowler 1";

    // Build complete, correctly-named batsmen object from setup player names
    // This fixes the bug where old match player names persisted across preset switches
    const builtBatsmen = setup.batsmen || {
      [striker]:    { runs: parseInt(setup.batsmanRuns || 32), balls: parseInt(setup.batsmanBalls || 22), fours: 2, sixes: 1, active: true },
      [nonStriker]: { runs: parseInt(setup.nonStrikerRuns || 14), balls: parseInt(setup.nonStrikerBalls || 10), fours: 1, sixes: 0, active: true },
      [`${setup.battingTeam || "Team"} No. 5`]: { runs: 0, balls: 0, fours: 0, sixes: 0, active: false },
      [`${setup.battingTeam || "Team"} No. 6`]: { runs: 0, balls: 0, fours: 0, sixes: 0, active: false }
    };

    // Build complete, correctly-named bowlers object from setup player names
    const builtBowlers = setup.bowlers || {
      [bowler]: { overs: 2.0, maidens: 0, runs: 18, wickets: 1 },
      [`${setup.bowlingTeam || "Team"} Alt Bowler`]: { overs: 3.0, maidens: 0, runs: 28, wickets: 1 }
    };

    // Legacy alias so nothing breaks downstream
    const defaultBatsmen = builtBatsmen;
    const defaultBowlers = builtBowlers;

    this.gameState = {
      battingTeam: setup.battingTeam || "RCB",
      bowlingTeam: setup.bowlingTeam || "CSK",
      target: parseInt(setup.target || 180),
      runs: parseInt(setup.runs || 120),
      wickets: parseInt(setup.wickets || 5),
      overs: setup.overs || "15.0",
      totalBalls: Math.floor(parseFloat(setup.overs || "15.0")) * 6 + Math.round((parseFloat(setup.overs || "15.0") - Math.floor(parseFloat(setup.overs || "15.0"))) * 10),
      requiredRuns: Math.max(0, parseInt(setup.target || 180) - parseInt(setup.runs || 120)),
      ballsRemaining: parseInt(setup.ballsRemaining || 30),
      currentOverHistory: [],
      batsmen: setup.batsmen || defaultBatsmen,
      bowlers: setup.bowlers || defaultBowlers,
      currentBatsman: setup.currentBatsman || Object.keys(setup.batsmen || defaultBatsmen)[0],
      currentNonStriker: setup.currentNonStriker || Object.keys(setup.batsmen || defaultBatsmen)[1],
      currentBowler: setup.currentBowler || Object.keys(setup.bowlers || defaultBowlers)[0],
      winProbability: setup.winProbability || { batting: 50, bowling: 50 },
      momentum: setup.momentum || 0,
      hypeLevel: setup.hypeLevel || 60,
      history: []
    };
  }

  getCurrentState() {
    return this.gameState;
  }

  queueCustomBall(customData) {
    // Custom data format: { runs: 6 / 'W', batsman: '...', bowler: '...' }
    this.customQueue.push(customData);
  }

  processNextBall() {
    // Check if match is already over
    if (this.gameState.ballsRemaining <= 0 || this.gameState.runs >= this.gameState.target || this.gameState.wickets >= 10) {
      return { ended: true, state: this.gameState };
    }

    let ballData;

    // Check if there is a custom ball queued from admin
    if (this.customQueue.length > 0) {
      const custom = this.customQueue.shift();
      ballData = this.generateCustomBall(custom);
    } else {
      // Otherwise, get the next scripted ball
      if (this.currentBallIndex < SCRIPTED_BALLS.length) {
        ballData = SCRIPTED_BALLS[this.currentBallIndex];
        this.currentBallIndex++;
      } else {
        // Fallback generator if they keep playing past 20 overs
        ballData = this.generateDynamicBall();
      }
    }

    this.applyBallToState(ballData);
    return { ended: false, ball: ballData, state: this.gameState };
  }

  generateCustomBall(custom) {
    const oversCount = parseFloat(this.gameState.overs);
    const completedOvers = Math.floor(oversCount);
    const ballsInOver = Math.round((oversCount - completedOvers) * 10);
    let nextBalls = ballsInOver + 1;
    let nextOvers = completedOvers;
    if (nextBalls >= 6) {
      nextBalls = 0;
      nextOvers += 1;
    }
    const nextOverStr = `${nextOvers}.${nextBalls}`;

    let isWicket = custom.runs === "W" || custom.wicket !== null;
    let runsScored = isWicket ? 0 : parseInt(custom.runs || 0);

    const batsmanName = custom.batsman || this.gameState.currentBatsman;
    const bowlerName = custom.bowler || this.gameState.currentBowler;

    let commentary = "";
    let ballType = custom.ballType || "Good length delivery";
    let speed = custom.ballSpeed || `${(135 + Math.random() * 15).toFixed(1)} km/h`;

    const battingTeam = this.gameState.battingTeam || 'batting team';
    const bowlingTeam = this.gameState.bowlingTeam || 'bowling team';
    if (isWicket) {
      commentary = `WICKET! ${batsmanName} has been dismissed by ${bowlerName}! The ${bowlingTeam} roar with delight!`;
    } else if (runsScored === 6) {
      commentary = `SIX! What a shot! ${batsmanName} launches ${bowlerName} high into the stands! The ${battingTeam} fans are going absolutely wild!`;
    } else if (runsScored === 4) {
      commentary = `FOUR! Smacked! ${batsmanName} drives this through the covers, beating the infield for a boundary! ${battingTeam} closing in!`;
    } else if (runsScored === 0) {
      commentary = `Dot ball. Excellent accuracy shown by ${bowlerName}, leaving ${batsmanName} with no room to score.`;
    } else {
      commentary = `${runsScored} run${runsScored > 1 ? "s" : ""}. ${batsmanName} tucks this ball from ${bowlerName} and runs hard.`;
    }

    // Dynamic probability calculations
    const prevProb = this.gameState.winProbability.batting;
    let newProb = prevProb;
    let momentumVal = this.gameState.momentum;
    let hype = 70;

    if (isWicket) {
      newProb = Math.max(5, prevProb - 20);
      momentumVal = Math.max(-100, momentumVal - 50);
      hype = 95;
    } else if (runsScored === 6) {
      newProb = Math.min(95, prevProb + 15);
      momentumVal = Math.min(100, momentumVal + 40);
      hype = 98;
    } else if (runsScored === 4) {
      newProb = Math.min(95, prevProb + 8);
      momentumVal = Math.min(100, momentumVal + 20);
      hype = 85;
    } else if (runsScored === 0) {
      newProb = Math.max(5, prevProb - 5);
      momentumVal = Math.max(-100, momentumVal - 10);
      hype = 50;
    } else {
      newProb = Math.min(95, Math.max(5, prevProb + (runsScored - 1.5) * 2));
      momentumVal = Math.min(100, Math.max(-100, momentumVal + (runsScored - 1) * 5));
      hype = 60;
    }

    return {
      over: nextOverStr,
      batsman: batsmanName,
      bowler: bowlerName,
      runs: isWicket ? 0 : runsScored,
      wicket: isWicket ? {
        player: batsmanName,
        type: "Dismissed",
        description: custom.wicketDescription || "Caught inside the circle trying to accelerate."
      } : null,
      ballSpeed: speed,
      ballType: ballType,
      commentarySeed: commentary,
      winProbability: { batting: Math.round(newProb), bowling: Math.round(100 - newProb) },
      momentum: Math.round(momentumVal),
      hypeLevel: hype
    };
  }

  generateDynamicBall() {
    // Dynamic generation if they run out of pre-scripted over 20
    const runsList = [0, 1, 1, 2, 4, 6];
    const outcomes = ["dot", "single", "single", "double", "boundary", "six", "wicket"];
    const out = outcomes[Math.floor(Math.random() * outcomes.length)];

    let custom = {
      runs: 0,
      wicket: null
    };

    if (out === "wicket") {
      custom.runs = "W";
      custom.wicketDescription = "Struck on pads. Plumb LBW!";
    } else if (out === "six") {
      custom.runs = 6;
    } else if (out === "boundary") {
      custom.runs = 4;
    } else if (out === "double") {
      custom.runs = 2;
    } else if (out === "single") {
      custom.runs = 1;
    }

    return this.generateCustomBall(custom);
  }

  applyBallToState(ball) {
    const isWicket = ball.wicket !== null;
    const runsScored = ball.runs;

    // 1. Update scoreboard
    this.gameState.runs += runsScored;
    this.gameState.ballsRemaining -= 1;

    if (isWicket) {
      this.gameState.wickets += 1;
    }

    this.gameState.requiredRuns = Math.max(0, this.gameState.target - this.gameState.runs);

    // 2. Process Overs counting
    const oversCount = parseFloat(this.gameState.overs);
    const completedOvers = Math.floor(oversCount);
    const ballsInOver = Math.round((oversCount - completedOvers) * 10);

    let nextBalls = ballsInOver + 1;
    let nextOvers = completedOvers;

    if (nextBalls >= 6) {
      nextBalls = 0;
      nextOvers += 1;
      this.gameState.currentOverHistory = []; // Reset over log on new over
    }
    this.gameState.overs = `${nextOvers}.${nextBalls}`;

    // Over history indicator
    this.gameState.currentOverHistory.push(isWicket ? "W" : runsScored);

    // 3. Update batsman and bowler statistics
    const bat = this.gameState.batsmen[ball.batsman];
    if (bat) {
      bat.runs += runsScored;
      bat.balls += 1;
      if (runsScored === 4) bat.fours += 1;
      if (runsScored === 6) bat.sixes += 1;
      if (isWicket) {
        bat.active = false;
      }
    }

    const bowl = this.gameState.bowlers[ball.bowler];
    if (bowl) {
      bowl.runs += runsScored;
      const bCount = Math.round((bowl.overs - Math.floor(bowl.overs)) * 10) + 1;
      if (bCount >= 6) {
        bowl.overs = (Math.floor(bowl.overs) + 1).toFixed(1);
      } else {
        bowl.overs = (Math.floor(bowl.overs) + bCount / 10).toFixed(1);
      }
      if (isWicket) {
        bowl.wickets += 1;
      }
    }

    // Handle new incoming batsman on Wicket
    if (isWicket && this.gameState.wickets < 10) {
      const allBatsmen = Object.keys(this.gameState.batsmen);
      const nextBat = allBatsmen.find(b => !this.gameState.batsmen[b].active && this.gameState.batsmen[b].runs === 0);
      if (nextBat) {
        this.gameState.batsmen[nextBat].active = true;
        this.gameState.currentBatsman = nextBat;
      }
    } else if (runsScored % 2 === 1) {
      // Strike rotation on odd runs
      const temp = this.gameState.currentBatsman;
      this.gameState.currentBatsman = this.gameState.currentNonStriker;
      this.gameState.currentNonStriker = temp;
    }

    // Rotate strike on end of over
    if (nextBalls === 0) {
      const temp = this.gameState.currentBatsman;
      this.gameState.currentBatsman = this.gameState.currentNonStriker;
      this.gameState.currentNonStriker = temp;

      // Rotate bowlers
      const allBowlers = Object.keys(this.gameState.bowlers);
      const nextBowl = allBowlers.find(b => b !== ball.bowler);
      if (nextBowl) {
        this.gameState.currentBowler = nextBowl;
      }
    }

    // 4. Update probability & gauges
    this.gameState.winProbability = ball.winProbability;
    this.gameState.momentum = ball.momentum;
    this.gameState.hypeLevel = ball.hypeLevel;

    // 5. Append to historical log
    this.gameState.history.unshift({
      over: ball.over,
      runs: runsScored,
      wicket: ball.wicket,
      batsman: ball.batsman,
      bowler: ball.bowler,
      commentarySeed: ball.commentarySeed,
      hypeLevel: ball.hypeLevel
    });
  }
}

export default new SimulationEngine();
