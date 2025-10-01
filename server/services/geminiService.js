const axios = require('axios');

const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const parseAIResponse = (aiResponse) => {
  const content = aiResponse.data.choices[0].message.content;
  
  // Remove markdown code blocks
  let cleanedText = content.replace(/```json/g, '').replace(/```/g, '');
  
  // Remove special tokens that might be present in the response
  cleanedText = cleanedText.replace(/<s>/g, '').replace(/<\/s>/g, '');
  cleanedText = cleanedText.replace(/\[OUT\]/g, '').replace(/\[\/OUT\]/g, '');
  cleanedText = cleanedText.replace(/\[INST\]/g, '').replace(/\[\/INST\]/g, '');
  cleanedText = cleanedText.replace(/\[B_INST\]/g, '').replace(/\[\/B_INST\]/g, '');
  
  // Remove any leading/trailing whitespace and newlines
  cleanedText = cleanedText.trim();
  
  // Try to extract JSON from the cleaned text if it's embedded in other text
  const jsonMatch = cleanedText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedText = jsonMatch[0];
  }
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.error('Original content:', content);
    console.error('Cleaned text:', cleanedText);
    throw new Error(`Invalid JSON response from AI service: ${error.message}`);
  }
};

const getQuestsFromAI = async (goal) => {
  const prompt = `
    You are a Project Dungeon Master. A user wants to achieve the following goal: "${goal}".
    Break this goal down into 5 to 7 sequential, actionable steps.
    For each step, provide a fantasy-themed "title", a short narrative "description", and a concrete real-world "task".
    Return your response ONLY as a valid JSON array of objects. Do not include any other text or explanation.
  `;
  
  const response = await openrouter.post('/chat/completions', {
    model: 'mistralai/mistral-7b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
  });

  return parseAIResponse(response);
};

const getLootFromAI = async (completedTask) => {
  const model = 'mistralai/mistral-7b-instruct:free';

  const prompt = `
    A hero in our world just completed this real-world task: "${completedTask}".
    Generate a single, thematic, fantasy loot item as a reward.
    Provide an "itemName", a "description", and a "type" (e.g., 'Weapon', 'Armor', 'Scroll').
    
    Additionally, create an "imagePrompt". This prompt should be a concise, descriptive phrase for a text-to-image model to generate a stylistic, transparent PNG of the item. The style should be like a video game inventory icon.
    
    Return your response ONLY as a valid JSON object. Do not include any other text.
    Example format:
    {
      "itemName": "Tome of Diligence",
      "description": "A book that grants +5 to focus on tedious tasks.",
      "type": "Scroll",
      "imagePrompt": "Stylized fantasy spellbook icon, glowing runes, vibrant colors, transparent background, game asset"
    }
  `;

  const response = await openrouter.post('/chat/completions', {
    model: model,
    messages: [{ role: 'user', content: prompt }],
  });
  
  return parseAIResponse(response);
};

module.exports = { getQuestsFromAI, getLootFromAI };
