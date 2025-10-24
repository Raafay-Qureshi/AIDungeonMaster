const axios = require('axios');

const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const parseAIResponse = (aiResponse) => {
  // Check if response structure is valid
  if (!aiResponse?.data?.choices?.[0]?.message?.content) {
    console.error('Invalid AI response structure:', JSON.stringify(aiResponse?.data, null, 2));
    throw new Error('AI service returned invalid response structure');
  }
  
  const content = aiResponse.data.choices[0].message.content;
  
  // Check if content is empty or undefined
  if (!content || content.trim() === '') {
    console.error('AI returned an empty response');
    throw new Error('AI service returned an empty response');
  }
  
  // Remove markdown code blocks
  let cleanedText = content.replace(/```json/g, '').replace(/```/g, '');
  
  // Remove special tokens that might be present in the response
  cleanedText = cleanedText.replace(/<s>/g, '').replace(/<\/s>/g, '');
  cleanedText = cleanedText.replace(/\[OUT\]/g, '').replace(/\[\/OUT\]/g, '');
  cleanedText = cleanedText.replace(/\[INST\]/g, '').replace(/\[\/INST\]/g, '');
  cleanedText = cleanedText.replace(/\[B_INST\]/g, '').replace(/\[\/B_INST\]/g, '');
  
  // Remove any leading/trailing whitespace and newlines
  cleanedText = cleanedText.trim();
  
  // Check if cleaned text is empty
  if (!cleanedText) {
    console.error('Cleaned text is empty after processing');
    console.error('Original content:', content);
    throw new Error('No valid content found in AI response after cleaning');
  }
  
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
  // Try multiple models in case one is rate-limited
  const models = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  const prompt = `A hero completed: "${completedTask}".
Generate a fantasy loot item as JSON ONLY (keep description under 80 characters):
{
  "itemName": "Creative fantasy item name",
  "description": "Brief description (max 80 chars)",
  "type": "Weapon|Armor|Scroll|Potion|Trinket",
  "rarity": "Common|Uncommon|Rare|Epic|Legendary (weighted: 40% Common, 30% Uncommon, 20% Rare, 8% Epic, 2% Legendary)",
  "imagePrompt": "Simple game icon: [item], fantasy RPG style, transparent background"
}`;

  let lastError;
  
  for (const model of models) {
    try {
      console.log(`Attempting loot generation with model: ${model}`);
      
      const response = await openrouter.post('/chat/completions', {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const loot = parseAIResponse(response);
      console.log(`Successfully generated loot with ${model}:`, loot);
      return loot;
      
    } catch (error) {
      console.error(`Failed with model ${model}:`, error.message);
      lastError = error;
      
      // If rate limited, try next model immediately
      if (error.response?.status === 429) {
        continue;
      }
      
      // For other errors, wait a bit before trying next model
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All AI models failed to generate loot');
};

module.exports = { getQuestsFromAI, getLootFromAI };
