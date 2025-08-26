const axios = require('axios');
const { Character } = require('../models/Character');

const generateImageFromPrompt = async (req, res) => {
  console.log("=== IMAGE GENERATION REQUEST RECEIVED ===");
  const { prompt, itemName, characterId } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required." });
  }
  
  try {
    // Check if image already exists in database
    if (characterId && itemName) {
      const character = await Character.findById(characterId);
      if (character) {
        const existingItem = character.inventory.find(item => item.itemName === itemName);
        if (existingItem && existingItem.imageData) {
          console.log(`Returning cached base64 image for ${itemName}`);
          
          // Convert base64 back to buffer and send
          const imageBuffer = Buffer.from(existingItem.imageData, 'base64');
          res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400'
          });
          return res.send(imageBuffer);
        }
      }
    }

    // Generate new image
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      { prompt: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const imageBuffer = Buffer.from(response.data);
    
    // Store as base64 in database instead of file system
    if (characterId && itemName) {
      const base64Image = imageBuffer.toString('base64');
      
      await Character.findByIdAndUpdate(
        characterId,
        {
          $set: {
            "inventory.$[item].imageData": base64Image // Store base64 instead of URL
          }
        },
        {
          arrayFilters: [{ "item.itemName": itemName }]
        }
      );
      
      console.log(`Image stored as base64 in database for ${itemName}`);
    }

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error("Image generation failed:", error.message);
    res.status(500).json({
      message: "Image generation failed. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { generateImageFromPrompt };