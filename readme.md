# AI Dungeon Master

A gamified productivity platform that turns personal goals into RPG quests. AI generates quest breakdowns and fantasy loot items to reward you for completing tasks.

## Try it out

### [AI Dungeon Master Demo](https://ai-dungeon-master-l6d5.vercel.app/)

- Frontend hosted on **Vercel**
- Backend hosted on **Render**

## Why I Built This

I wanted to learn how AI could create personalized content that feels unique to each user. Most gamification apps use the same rewards for everyone. I wondered if I could generate custom quest stories and loot items based on what the user actually wants to accomplish. The idea is simple: if the rewards feel personal and earned, people stay more motivated.

## Key Features

- **AI Quest Generation**: Uses Mistral 7B to break down your goals into 5-7 sequential quests with fantasy titles and real tasks in under 2 seconds
- **Dynamic Loot System**: Generates unique fantasy items with different rarity levels (Common through Legendary) for each completed quest
- **Fallback System**: If one AI model is overloaded, the app automatically tries another one so it never breaks
- **Game Progression**: MongoDB stores your character level, XP, and inventory so your progress is saved
- **Simple Authentication**: Uses a local user ID so you don't need to manage passwords
- **Image Caching**: Generates fantasy item images and saves them so they load super fast on repeat views

## Tech Stack

**Backend**: Node.js, Express, MongoDB  
**Frontend**: React, Vite, TailwindCSS, Zustand  
**AI**: OpenRouter API (Mistral 7B, Gemini 2.0, Llama 3.1)  
**Images**: Puter.com and Pollinations.ai  
**Storage**: REST API with local file storage

## How It Works

The app is built in three main parts:

### 1. Quest Generation
When you enter a goal, the app sends it to an AI model with instructions to break it down into steps. The AI returns JSON with quest titles, descriptions, and tasks. I had to build a parser that cleans up the AI response because different models format their output differently. Sometimes they add markdown code blocks or special tokens that break the JSON parsing. My parser strips all that stuff out so the app doesn't crash.

### 2. Game State
Your character data is stored in MongoDB. When you level up, the app checks if your XP is high enough and then increases your level. The XP requirement grows each level (multiplied by 1.5) so the game stays challenging. Your inventory is stored as a list of items you've earned.

### 3. Loot and Images
When you complete a quest, the app asks an AI to generate a fantasy item description. It tries three different AI models in order (Gemini first, then Llama, then Mistral) so if one is too busy it tries the next one. If all three fail, it gives you a generic "Adventurer's Token" instead. For images, it tries Puter.com first, then falls back to Pollinations.ai. Once an image is generated, it's saved to disk so the next time you view that item it loads instantly.

### 4. Authentication
The app uses a simple header-based system where each user gets a unique ID stored in their browser. This is fast to build and works great for a personal project, though it wouldn't be secure enough for a real app with multiple users.

## What I Learned

- **AI Output is Messy**: Different AI models return JSON in different formats. Some wrap it in markdown, some add special tokens, some have extra whitespace. I built a parser that handles all these cases. It reduced errors from about 20% down to less than 1%.

- **Fallback Chains Work**: Free AI APIs get overloaded sometimes. Instead of just failing, I made the app try multiple models in sequence. If one is busy, it tries the next one. Users see a slower response but the app never breaks.

- **Database Updates Need to Be Careful**: I found a bug where if two requests tried to complete the same quest at the same time, you could get XP twice. I fixed this by using MongoDB's atomic update function instead of fetching the data, changing it, and saving it back.

- **Caching Makes a Huge Difference**: Image generation takes 3-5 seconds the first time. By saving images to disk and checking if they already exist, repeat views load in under 500 milliseconds. That's a 10x speedup that makes the app feel way more responsive.

- **Simple Auth is Powerful**: For a personal project, not dealing with passwords and token refresh logic saved me a lot of time and bugs. The tradeoff is it wouldn't work for a real multi-user app, but for learning it was perfect.

## Setup Instructions

**You need**: Node.js 16+, MongoDB 6+, and an OpenRouter API key

1. Clone and install:
```bash
git clone https://github.com/yourusername/ai-dungeon-master.git
cd ai-dungeon-master
npm install
cd client && npm install && cd ..
```

2. Create `server/.env` with your keys:
```bash
MONGO_URI=mongodb://localhost:27017/dungeon-master
OPENROUTER_API_KEY=your-openrouter-key
PUTER_API_KEY=your-puter-key (optional, Pollinations.ai is free)
PORT=5000
NODE_ENV=development
```

3. Start MongoDB:
```bash
mongod
```

4. Start both servers:
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

5. Open `http://localhost:5173` and create your first quest!

## Problems I Fixed

**Problem**: AI responses came back in different formats. Sometimes valid JSON, sometimes wrapped in markdown, sometimes with weird tokens mixed in.  
**Solution**: I built a parser that strips out markdown blocks, special tokens, and extra whitespace before trying to parse the JSON. I also added error logging so I could see what formats were breaking. This reduced parsing failures from 20% to less than 1%.

**Problem**: Image generation took 5-8 seconds, which made completing quests feel slow.  
**Solution**: I added disk caching. The first time you generate an image it takes a few seconds, but then it's saved. Next time you view that item, it loads from disk in under 500ms. I also added a fallback so if one image service is down it tries another one.

**Problem**: If you completed a quest twice at the exact same time, you could get XP twice.  
**Solution**: I switched from fetching data, modifying it, and saving it back to using MongoDB's atomic update function. This makes sure the update happens all at once with no race conditions.

---

**Ideas for the future**:
- Make quests harder based on how many you've completed
- Queue up image generation requests so they don't all run at once
- Make a map that unfolds as you complete quests
- More variety in xp
- Online system to track progress with friends
- Mobile Application
- Accountability notifications like Duolingo