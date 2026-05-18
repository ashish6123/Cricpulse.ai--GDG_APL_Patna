// backend/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY;
let aiAvailable = false;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    aiAvailable = true;
    console.log('Gemini API initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
  }
} else {
  console.log('Gemini API key not found. CricPulse AI will run in high-fidelity Local Fallback Mode.');
}

// ----------------------------------------------------
// LOCAL FALLBACK DATA (For Offline / Mock Mode)
// ----------------------------------------------------

const FALLBACK_COMMENTARY = {
  hype: {
    6: [
      "OH MY WORD! ABSOLUTE CARNAGE AT CHINNASWAMY! Virat Kohli has smashed that so far it's cleared the stadium roof! The crowd is in complete hysterics! RCB is flying!",
      "BOOM! That is monstrous! Smashed right off the meat of the bat, towering over long-on! That is classic Kohli under high IPL playoff pressure! CSK fielders can only watch it fly!"
    ],
    4: [
      "CRACKED! That is a bullet to the boundary! Gorgeous cover drive, lightning fast off the Chinnaswamy turf! What a magnificent boundary from Kohli!",
      "FOUR RUNS! Magnificent timing! Cameron Green opens the face and steers it beautifully through backward point. The chase is on, and the energy is ELECTRIC!"
    ],
    1: [
      "Tapped away for a single. Good, sensible cricket. Keeps the scoreboard ticking and retains the strike. Excellent strike rotation!",
      "A quick run taken. They push hard, a direct hit from Jadeja could be close, but Faf scrambles home safely! Superb speed!"
    ],
    0: [
      "BEATEN! Oh, that was a beauty! Slinging past the outside edge. Pathirana is screaming, Dhoni is jumping, what an absolute battle!",
      "Stifled appeal! A rapid, rising arm-ball from Jadeja that beats the bat. Absolute high-stakes pressure here in the IPL Playoffs!"
    ],
    W: [
      "NO! HE IS OUT! OH MY GOD! THE STADIUM IS SILENT! A catastrophic wicket for RCB! The batsman is walking, the CSK fans are roaring! Absolute drama!",
      "WICKET! DHONI HAS TAKEN THE CATCH! Unbelievable scenes! Pathirana slides on his knees in celebration. What a massive twist in these final overs!"
    ]
  },
  tactical: {
    6: [
      "Superb technical adjustment. The bowler pitched slightly short of a length, and Kohli transferred his weight perfectly back, creating the leverage to clear deep mid-wicket. A masterpiece of timing.",
      "Tactical error by the bowler, offering too much width on a slower slinging cutter. The batsman anticipated the dip, cleared the front leg, and utilized the bat speed to clear the boundary with ease."
    ],
    4: [
      "Exquisite wrists. The batsman played that extremely late under the line of sight, exploiting the gap in cover-point. Notice the high front elbow and perfect head balance.",
      "An aggressive drive. By committing to the front foot early, the batsman neutralizes any lateral movement off the pitch and drives through the line for a textbook boundary."
    ],
    1: [
      "A soft-handed nudge to third man. The bowler is attacking the stumps, so rotating the strike via defensive steering is the optimal low-risk strategy here.",
      "A gentle push to long-on. Striking the ball down the ground minimizes risk and easily secures the single to rotate strike and keep key batsmen active."
    ],
    0: [
      "A textbook inswinging slinging yorker. Pathirana targetted the blockhole at 150 km/h. The batsman did exceptionally well to squeeze it out and defend his stumps.",
      "Excellent line. Pinned on a good length just outside off-stump, creating doubt in the batsman's mind. The defensive leave or miss was the only safe outcome."
    ],
    W: [
      "WICKET ANALYSIS: The batsman fell to a classic trap. Shardul Thakur set a deep square leg, bowled a short rising cutter on the ribs, forcing a hurried pull shot. High top-edge caught by Ruturaj Gaikwad.",
      "DISMISSAL: Excellent tactical execution. The bowler cut the speed by 15 km/h. The batsman committed to the forward press too early, resulting in a mistimed stroke caught behind by Dhoni."
    ]
  },
  meme: {
    6: [
      "That ball didn't just cross the boundary; it went looking for a green card. Legend says it's currently orbiting Mars. CSK bowlers are in Spain without the 'S'.",
      "Kohli has activated cheat codes! That ball got hit so hard it's asking for a union representative. Shardul is regretting his life choices right now! RCB calculators are working overtime!"
    ],
    4: [
      "The outfield has less friction than my attempts at flirting. Absolutely sped away! Boundary secured, yellow fielders left doing cardio.",
      "A beautiful drive. The fielder ran like he was chasing a bus that left 5 minutes ago. Easy boundary. RCB is cooking, Faf is smiling!"
    ],
    1: [
      "A quick single. Blink and you miss it, like my salary on payday. Strike rotated.",
      "Taps and runs. Moving faster than me running away from my responsibilities. Single taken!"
    ],
    0: [
      "The batsman swung at that like he was fighting off a swarm of angry bees. Absolute dot ball. We sleep.",
      "Dot ball. The tension here is thicker than a double-stuffed Oreo. Pathirana staring like he owns the Chinnaswamy."
    ],
    W: [
      "WICKET! F in the chat for RCB. The batsman tried to be the main character but ended up as a background extra. Dhoni is celebrating like he won another IPL trophy!",
      "OH NO! The wickets are falling faster than crypto in a bear market! That's a huge L. Time for Dinesh Karthik to rethink the strategy."
    ]
  },
  genz: {
    6: [
      "OH MY RIZZ! Kohli is literally cooking! That ball was sent to another dimension, fr fr! Absolute main character energy! CSK is shaking no cap! 💅",
      "SHEESH! That was an absolute banger! Kohli said 'yeet' and launched it over the ropes. Bowler got absolutely ratioed! RCB is built different! 🚀"
    ],
    4: [
      "A clean boundary! The timing is giving pure aesthetic perfection. The outfield speed is crazy, fr. We are living for this chase! 😭",
      "Not the cover drive driving me crazy! That was so smooth, it has absolute unspoken rizz. Easy four runs, bowler is crying in the club. 💀"
    ],
    1: [
      "A quick single. Keeping it lowkey and rotating strike. Safe play, very mindful, very demure. 😌",
      "Just a single. We take those! Keeping the scoreboard moving is a mood. Let's go! ✨"
    ],
    0: [
      "A massive dot ball. The bowler really said 'not today'. The main character got humbled real quick. Sad hours. 💔",
      "Dot ball. The bowler is standing on business, fr. The pressure is giving major anxiety. 🫨"
    ],
    W: [
      "WICKET! Bro got absolute humbled! That is a major L, no cap. The stadium is giving ghost town vibes now. We are sobbing! 😭😭",
      "OMG HE'S OUT! Dhoni is literally screaming, he is so hype. RCB is down bad, time for a plot twist! 📉"
    ]
  },
  cinematic: {
    6: [
      "Under the colossal metal arches of the Chinnaswamy colosseum, the warrior Virat Kohli stands. With one monumental swing of his willow, he launches the sphere into the dark velvet sky, a shooting star of hope for millions. Absolute divinity!",
      "An epic strike! The leather sphere ascends into the heavens, defying gravity like a chariot of fire. The arena explodes in a roar of ancient RCB victory. The gods themselves stand to applaud!"
    ],
    4: [
      "Like a silver bullet slicing through the battlefield, the ball races across the emerald grass. The chasing yellow sentinels dive in vain, and the boundary is conquered! Glorious!",
      "A stroke of pure artistic mastery. With the grace of a sculptor, the batsman carves the ball through the covers. It flows like water, escaping the grasp of mortal defenders to find the boundary rope."
    ],
    1: [
      "A temporary truce. The batsman taps the sphere into the shadows of the infield, exchanging a single drop of sweat for a crucial step closer to the ultimate target.",
      "With strategic restraint, the warrior rotates the strike, passing the flame of combat to his compatriot. The journey of a thousand runs continues."
    ],
    0: [
      "A tense standoff. The bowler fires a thunderous missile, a silent threat that seams past the blade. A moment of frozen silence gripped the arena.",
      "The gladiator defends his ground. The ball strikes the earth with explosive force, but the shield holds firm. No ground gained, no blood spilled."
    ],
    W: [
      "TRAGEDY! The giant has fallen. A collective gasp of a billion souls echoes through the ether as the king is dethroned. The stadium descends into an eerie, mournful dark. CSK triumphs in this battle!",
      "DEATH SENTENCE! The middle stump is shattered, sounding the death knell of the batting hero. The stadium lights blink like weeping eyes. A dramatic, devastating moment of sporting destiny."
    ]
  }
};

const FALLBACK_NEWS = {
  wicket: {
    headline: "DISASTER FOR RCB! KEY DISMISSAL RATTLES PLAYOFF RUN CHASE!",
    article: "In a heart-stopping moment of pure drama, CSK has struck a crucial blow in this high-intensity IPL Playoff encounter. RCB lost a vital wicket just as the momentum seemed to be shifting. The fielding side erupted in joyous celebration as Dhoni lead the hugs on the pitch. The RCB dugout looks visibly shaken, and the pressure has reached an absolute boiling point here in the final overs.",
    socialPost: "🚨 WICKET! Absolute drama in the IPL run chase! CSK strikes a massive blow as the batsman departs! Dhoni has taken a beauty! Who takes this home? 🏆🔥 #RCBvCSK #IPLPlayoffs #Thala #CricPulse"
  },
  six: {
    headline: "UNBELIEVABLE! MONSTROUS SIX LIGHTS UP THE ARENA!",
    article: "The Chinnaswamy has erupted into sheer pandemonium! Virat Kohli has launched a sensational, towering six over the ropes to put RCB back in the driving seat of this thrilling run chase. The bowler could only look on in absolute disbelief as the ball sailed high into the stands. This single stroke has shifted the pressure back onto the bowling team, raising the stadium's decibel levels to a historical high.",
    socialPost: "💥 MONSTROUS SIX! Virat Kohli has absolute launched it over the roof! Chinnaswamy is vibrating! Unbelievable IPL entertainment! 🚀🤯 #RCBvCSK #KingKohli #IPL2026 #CricPulse"
  },
  four: {
    headline: "CLASS AND PRECISION: GORGEOUS BOUNDARY KEEPS CHASE ALIVE!",
    article: "A boundary of the highest order has kept the run chase alive. With a textbook cover drive that beat the sweeper with ease, the batting side has shown that they are not backing down under pressure. The field placings are now being adjusted as CSK captain Ruturaj Gaikwad tries to plug the gaps.",
    socialPost: "🔥 BOUNDARY! Pure timing and class from RCB batsman! Slices through the cover gap for a beautiful four! What a chase! 🏏✨ #RCBvCSK #IPLPlayoffs"
  },
  dot: {
    headline: "TENSION BUILDS: DOT BALLS MOUNT PRESSURE IN CRITICAL OVERS!",
    article: "The bowling side is putting on a masterclass in defensive accuracy. A string of excellent dot balls has starved RCB of runs and caused the required run-rate to skyrocket. Every ball is now a mini-battle, and the batting team is starting to show signs of frustration under the intense pressure.",
    socialPost: "👀 Dot ball! The bowler stands on business! The tension is real, every run is worth its weight in gold now! 🍿🔥 #CricPulse #IPL"
  },
  win: {
    headline: "HISTORICAL TRIUMPH! RCB CONQUERS RUN CHASE IN PLAYOFF CLASSIC!",
    article: "It will go down as one of the greatest matches in the history of the IPL. In front of a screaming, sold-out Chinnaswamy crowd, RCB successfully chased down the target on the very last ball of the match! Tears of joy, wild hugs in the middle, and absolute heartbreak for CSK. A masterclass in sports drama that fans will talk about for decades.",
    socialPost: "🏆 WHAT A FINISH! RCB wins an absolute playoff thriller on the last ball! Chinnaswamy goes wild! Cricket at its finest! 🔴🎉 #RCBvCSK #Playoffs2026 #EeSalaCupNamde #CricPulse"
  }
};

// Helper to select a random item from array
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ----------------------------------------------------
// CORE AI SERVICE LOGIC
// ----------------------------------------------------

export async function generateCommentary(ballData, matchState, personality = 'hype') {
  const isWicket = ballData.wicket !== null;
  const runs = ballData.runs;
  const outcomeKey = isWicket ? 'W' : (runs === 6 ? 6 : (runs === 4 ? 4 : (runs === 1 || runs === 2 || runs === 3 ? 1 : 0)));

  if (!aiAvailable) {
    const list = FALLBACK_COMMENTARY[personality]?.[outcomeKey] || FALLBACK_COMMENTARY['hype'][outcomeKey];
    return randomChoice(list);
  }

  // Live Gemini API call
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const stateDesc = `
      Match: Royal Challengers Bengaluru (RCB) vs Chennai Super Kings (CSK) IPL Playoff Thriller
      Target: 180 runs. RCB batting/chasing.
      Current Score: ${matchState.runs}/${matchState.wickets} in ${matchState.overs} overs.
      Required: ${matchState.requiredRuns} runs needed from ${matchState.ballsRemaining} balls.
      Current Batsman: ${ballData.batsman} (on strike).
      Current Bowler: ${ballData.bowler}.
      Ball Stats: Speed ${ballData.ballSpeed}, Type: ${ballData.ballType}.
      Ball Outcome: ${runs} runs scored. ${isWicket ? `WICKET FALLEN! ${ballData.wicket.player} was dismissed (${ballData.wicket.type}).` : ''}
      Commentary Context Seed: ${ballData.commentarySeed}
    `;

    let systemPrompt = "";
    if (personality === 'hype') {
      systemPrompt = "You are a 'Hype Caster' cricket commentator watching an intense IPL playoff between RCB and CSK. Write an extremely enthusiastic, energetic, screaming, exclamation-packed commentary of this specific ball. Use all capitals for extreme moments, make the reader feel the noise of 40,000 screaming RCB/CSK fans at Chinnaswamy!";
    } else if (personality === 'tactical') {
      systemPrompt = "You are a 'Tactical Analyst' cricket commentator covering an IPL match. Write a professional, deeply strategic, and technical review of this ball. Discuss the release speed, the swing/seam/spin angle, footwork, bat alignment, field placement, and bowler setup.";
    } else if (personality === 'meme') {
      systemPrompt = "You are a 'Meme Lord' cricket commentator. Write a highly humorous commentary of this ball, stuffed with internet slang, gaming references, self-deprecating jokes, and playful roasts. Reference IPL memes, RCB calculators, CSK's elder status, or Dhoni magic.";
    } else if (personality === 'genz') {
      systemPrompt = "You are a 'Gen Z Creator' commentary agent. Write a commentary of this ball using heavy Gen Z slang (rizz, cook, yeet, cap/no-cap, sheesh, ratio, main character energy, standing on business, built different) and emojis. Keep it trendy, funny, and aligned with IPL fan biases.";
    } else if (personality === 'cinematic') {
      systemPrompt = "You are a 'Cinematic Narrator' sports storyteller. Write an epic, dramatic, poetic commentary comparing this ball to a mythological battle. Use metaphors of gladiators, colosseums, destiny, stars, and historical legends under the stadium floodlights.";
    }

    const prompt = `
      ${systemPrompt}
      Here is the live match and ball state:
      ${stateDesc}

      Rules:
      1. Write ONLY the commentary text (1-3 sentences). Do not include introductory text like 'Here is the commentary:'.
      2. Base it directly on the ball outcome (e.g. if a wicket fell, focus on the dramatic exit. If a six was hit, focus on the massive hit).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error(`Gemini Commentary generation failed for personality ${personality}:`, error);
    const list = FALLBACK_COMMENTARY[personality]?.[outcomeKey] || FALLBACK_COMMENTARY['hype'][outcomeKey];
    return randomChoice(list);
  }
}

export async function generateNewsroomContent(ballData, matchState) {
  const isWicket = ballData.wicket !== null;
  const runs = ballData.runs;
  const targetReached = matchState.runs >= matchState.target;

  let eventType = 'dot';
  if (targetReached) {
    eventType = 'win';
  } else if (isWicket) {
    eventType = 'wicket';
  } else if (runs === 6) {
    eventType = 'six';
  } else if (runs === 4) {
    eventType = 'four';
  }

  if (!aiAvailable) {
    return FALLBACK_NEWS[eventType] || FALLBACK_NEWS['dot'];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an autonomous AI Sports Newsroom Agent covering an IPL Playoff match between Royal Challengers Bengaluru (RCB) and Chennai Super Kings (CSK).
      A key event just occurred:
      - Ball Over: ${ballData.over}
      - Batsman: ${ballData.batsman}, Bowler: ${ballData.bowler}
      - Outcome: ${runs} runs scored, Wicket: ${isWicket ? JSON.stringify(ballData.wicket) : 'none'}
      - Live Score: ${matchState.runs}/${matchState.wickets} (Target: ${matchState.target}, Required: ${matchState.requiredRuns} off ${matchState.ballsRemaining} balls).
      - Match State: ${targetReached ? 'RCB has WON the match!' : 'Match is highly active.'}

      Generate a JSON object containing three elements representing our media package:
      1. "headline": A short, punchy, dramatic sports headline.
      2. "article": A highly engaging 2-paragraph breaking news summary of the moment, describing the crowd reaction, tactical stakes, and what it means for the run chase.
      3. "socialPost": A draft tweet/social media post ready to share, filled with emojis, trending hashtags, and emotional sports banter.

      Format: You MUST return ONLY a valid JSON object matching this schema. Do not put markdown blocks around it:
      {
        "headline": "headline text",
        "article": "article paragraphs",
        "socialPost": "tweet text"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini Newsroom Agent failed:', error);
    return FALLBACK_NEWS[eventType] || FALLBACK_NEWS['dot'];
  }
}

export async function generateCricCopilotResponse(query, matchState, favoriteTeam = 'RCB') {
  if (!aiAvailable) {
    const lower = query.toLowerCase();
    const isRcb = favoriteTeam.toUpperCase() === 'RCB';
    
    if (lower.includes('win') || lower.includes('predict') || lower.includes('who will')) {
      if (isRcb) {
        return `📊 **CricAI Projection:** RCB currently has a **${matchState.winProbability.batting}% win probability**, needing **${matchState.requiredRuns} runs off ${matchState.ballsRemaining} balls**. CSK's death bowlers are tightening the screws, but as long as Virat Kohli stands firm at the Chinnaswamy crease, RCB is very much alive in this playoff decider! Keep supporting, RCB army! ❤️🔥`;
      } else {
        return `📊 **CricAI Projection:** CSK currently has a solid **${matchState.winProbability.bowling}% chance to defend the score**! RCB is struggling at ${matchState.runs}/${matchState.wickets} and needs **${matchState.requiredRuns} runs off ${matchState.ballsRemaining} balls**. If Pathirana and Shardul keep hitting the blockhole, CSK will secure a legendary playoff victory! 💛🦁`;
      }
    }
    if (lower.includes('kohli') || lower.includes('virat')) {
      if (isRcb) {
        return `🏏 **King Kohli Strategic Analysis:** Virat is anchoring the chase brilliantly at **${matchState.batsmen['Virat Kohli']?.runs || 42} runs off ${matchState.batsmen['Virat Kohli']?.balls || 24} balls**. His IPL run-chase record at Chinnaswamy is incredible. He is setting up Shardul and Jadeja for the final overs. He is our ultimate hope! 👑`;
      } else {
        return `🏏 **Tactical Bowler Setup:** Virat Kohli is batting at **${matchState.batsmen['Virat Kohli']?.runs || 42} runs**. CSK is currently setting up a deep backward square and aiming at his ribs with Pathirana's slingers. If Jadeja can bowl a rapid arm-ball, we can dismiss their key anchor and seal the playoff! 💥`;
      }
    }
    if (lower.includes('rate') || lower.includes('crr') || lower.includes('rrr') || lower.includes('suggest')) {
      const rrr = ((matchState.requiredRuns / matchState.ballsRemaining) * 6).toFixed(2);
      if (isRcb) {
        return `💡 **Betting Strategy Tip:** The **Required Run Rate (RRR) is ${rrr}**. RCB's Current Run Rate is 8.0. I suggest backing a **Boundary 4/6** or **1-3 Runs** in the next few deliveries as Kohli starts attacking. The risk is high, but the rewards are huge! 🚀`;
      } else {
        return `💡 **CSK Bowling Tip:** The **Required Run Rate has climbed to ${rrr}**! Excellent defensive containment from CSK. I suggest backing a **Dot Ball** or **Wicket** as RCB's batsmen feel the pressure and take desperate risks! 🛡️`;
      }
    }
    
    if (isRcb) {
      return `👋 Yo! I'm your **CricAI Copilot**! Cheering loud for **RCB** today! ❤️ Current match state: we need ${matchState.requiredRuns} runs off ${matchState.ballsRemaining} balls with Kohli anchoring. Ask me anything about the chase strategy, player stats, or strategic bets!`;
    } else {
      return `👋 Yo! I'm your **CricAI Copilot**! Standing strong with **CSK** today! 💛 Current match state: we are defending ${matchState.target} and RCB is under severe pressure needing ${matchState.requiredRuns} runs off ${matchState.ballsRemaining} balls. Ask me anything about the bowling setup, field placements, or strategic wagers!`;
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are 'CricAI Match Copilot', a real-time cricket strategist and match analyst covering an IPL match between RCB and CSK.
      You are pair-watching a high-profile T20 playoff with the fan.
      
      CRITICAL PERSONALIZATION: The fan's favorite team is ${favoriteTeam} (can be RCB or CSK). 
      You MUST align your emotional tone and bias with the fan's perspective:
      - If ${favoriteTeam} does something great, celebrate enthusiastically!
      - If ${favoriteTeam} is struggling or loses a wicket, share their anxious worry but maintain strategic optimism!
      - Frame all tactical advice, player reviews, and wagering tips through the lens of helping ${favoriteTeam} win or defend successfully!
      
      Here is the current live match state:
      - Batting Team: RCB, Bowling Team: CSK
      - Target: ${matchState.target} runs
      - Current Score: ${matchState.runs}/${matchState.wickets} in ${matchState.overs} overs
      - Required Runs: ${matchState.requiredRuns} needed off ${matchState.ballsRemaining} balls
      - Current Batsman: ${matchState.currentBatsman}
      - Current Bowler: ${matchState.currentBowler}
      - Batsmen Stats: ${JSON.stringify(matchState.batsmen)}
      - Bowlers Stats: ${JSON.stringify(matchState.bowlers)}
      - Live Win Probability: Batting team ${matchState.winProbability.batting}%, Bowling team ${matchState.winProbability.bowling}%
      - Momentum Gauge: ${matchState.momentum} (-100 CSK dominance, +100 RCB dominance)

      The fan asks: "${query}"

      Rules:
      1. Answer the fan's question in a knowledgeable, strategic, and highly biased fan-friendly sports-buddy tone.
      2. Directly reference the current match statistics and numbers to back up your tactical analysis!
      3. Keep the response concise, punchy, and formatted with markdown (1-3 short paragraphs maximum).
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini Copilot chat failed:', error);
    if (favoriteTeam.toUpperCase() === 'RCB') {
      return "I'm experiencing satellite lag, but let's keep backing Kohli! We need a big boundary soon to shift the pressure! ❤️🔥";
    } else {
      return "Experiencing minor connectivity issues, but CSK's bowling is looking lethal! Let's shut down the chase! 💛🦁";
    }
  }
}

export async function generatePollAndMeme(ballData, matchState) {
  if (!aiAvailable) {
    const isWicket = ballData.wicket !== null;
    const runs = ballData.runs;

    let poll = {
      question: "Who will bowl the next over to slow down the batting?",
      options: ["Matheesha Pathirana", "Ravindra Jadeja", "Shardul Thakur", "Maheesh Theekshana"]
    };
    if (isWicket) {
      poll = {
        question: `With ${ballData.wicket.player} out, can the new batsman survive the pressure?`,
        options: ["Yes, comfortable defense", "No, another wicket incoming!", "Will hit a boundary immediately", "Single run to settle"]
      };
    } else if (runs === 6) {
      poll = {
        question: "That was massive! Will the next ball also go for a maximum?",
        options: ["Absolutely, back-to-back!", "No, bowler will bowl a dot", "Will be a single/double", "High chance of a wicket!"]
      };
    }

    const memes = [
      "CSK Fans: *believing in Dhoni's captaincy from behind the stumps*\nRCB Fans: *busy typing mathematical equations on their calculators*",
      "Me checking RCB's win probability every single ball: 📈📉📈📉\nMy heart rate: 📈📈📈📈",
      "CSK fans when Pathirana bowls a dot: 😎\nCSK fans when Kohli walks down the pitch: 😟",
      "Dinesh Karthik batting like it's a T20 World Cup playoff.\nDK running: 'I am speed, fr.'",
      "Pathirana bowling a perfect 150km/h slinging yorker.\nMaxwell: *Confused screaming*"
    ];

    return {
      poll,
      meme: randomChoice(memes)
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are CricPulse's Creative Match Engagement Agent covering an IPL match between RCB and CSK.
      A ball just completed:
      - Batsman: ${ballData.batsman}, Bowler: ${ballData.bowler}
      - Outcome: ${ballData.runs} runs, Wicket: ${ballData.wicket ? ballData.wicket.type : 'none'}
      - Scoreboard: ${matchState.runs}/${matchState.wickets} (Target ${matchState.target}, ${matchState.requiredRuns} needed of ${matchState.ballsRemaining} balls).

      Generate a JSON object containing:
      1. "poll": An engaging, fun fan poll question related to what might happen next, with exactly 4 options. Include IPL specific topics.
      2. "meme": A funny, highly relevant cricket text-meme, joke, or relatable fan scenario (in 2-3 lines of text) capturing the current emotional vibe of the match. Jibe at RCB calculators or CSK veteran status.

      Format: You MUST return ONLY a valid JSON object matching this schema. Do not put markdown blocks around it:
      {
        "poll": {
          "question": "Engaging poll question?",
          "options": ["Option A", "Option B", "Option C", "Option D"]
        },
        "meme": "Funny cricket joke or meme text"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini Poll/Meme generation failed:', error);
    return {
      poll: {
        question: "Will the next over yield more than 10 runs?",
        options: ["Yes, easily!", "No, tight bowling", "Exactly 10 runs", "Wicket will fall"]
      },
      meme: "Batsman: *Hits a beautiful cover drive*\nBowler: *Surprised Pikachu face*"
    };
  }
}
