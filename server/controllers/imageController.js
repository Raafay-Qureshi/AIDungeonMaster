const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { Character } = require('../models/Character');

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../uploads/images');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.log('Uploads directory already exists or error creating:', error.message);
  }
};

// Try Puter.com txt2img API
const generateWithPuter = async (prompt) => {
  console.log('Attempting image generation with Puter.com...');
  
  try {
    const response = await axios.post(
      'https://api.puter.com/drivers/txt2img',
      {
        prompt: prompt,
        width: 512,
        height: 512
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY || ''}`
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );
    
    console.log('Puter.com image generation successful');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Puter.com generation failed:', error.message);
    throw error;
  }
};

// Fallback to Pollinations.ai
const generateWithPollinations = async (prompt) => {
  console.log('Attempting image generation with Pollinations.ai...');
  
  try {
    // Pollinations.ai provides a simple URL-based API
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`;
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    console.log('Pollinations.ai image generation successful');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Pollinations.ai generation failed:', error.message);
    throw error;
  }
};

const generateImageFromPrompt = async (req, res) => {
  console.log("=== IMAGE GENERATION REQUEST RECEIVED ===");
  console.log("Request body:", req.body);
  
  const { prompt, itemName, characterId } = req.body;

  if (!prompt) {
    console.log("Error: No prompt provided");
    return res.status(400).json({ message: "Prompt is required." });
  }
  
  try {
    // If characterId and itemName are provided, check if image already exists
    if (characterId && itemName) {
      const character = await Character.findById(characterId);
      if (character) {
        const existingItem = character.inventory.find(item => item.itemName === itemName);
        if (existingItem && existingItem.imageUrl) {
          console.log(`Returning cached image for ${itemName}:`, existingItem.imageUrl);
          
          // Check if file still exists
          const imagePath = path.join(__dirname, '../uploads/images', existingItem.imageUrl);
          try {
            const imageData = await fs.readFile(imagePath);
            res.set({
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
            });
            return res.send(imageData);
          } catch (fileError) {
            console.log('Cached image file not found, generating new one');
          }
        }
      }
    }

    console.log(`Generating new image for prompt: "${prompt}"`);

    let imageBuffer;
    let generationMethod = 'unknown';

    // Try Puter.com first, then fallback to Pollinations.ai
    try {
      imageBuffer = await generateWithPuter(prompt);
      generationMethod = 'puter';
    } catch (puterError) {
      console.log('Falling back to Pollinations.ai');
      try {
        imageBuffer = await generateWithPollinations(prompt);
        generationMethod = 'pollinations';
      } catch (pollinationsError) {
        throw new Error('All image generation services failed');
      }
    }

    console.log(`Image generated successfully using ${generationMethod}, size: ${imageBuffer.length} bytes`);

    // Create uploads directory
    await createUploadsDir();

    // Save the image to disk and update database if characterId and itemName provided
    if (characterId && itemName) {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${itemName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
      const imagePath = path.join(__dirname, '../uploads/images', filename);
      
      // Save image to disk
      await fs.writeFile(imagePath, imageBuffer);

      // Update character inventory with image URL
      await Character.findByIdAndUpdate(
        characterId,
        {
          $set: {
            "inventory.$[item].imageUrl": filename
          }
        },
        {
          arrayFilters: [{ "item.itemName": itemName }]
        }
      );

      console.log(`Image saved as: ${filename} and database updated`);
    }

    // Set appropriate headers for image response
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error("Image generation failed:", error.message);
    
    return res.status(500).json({
      message: "Image generation failed. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New endpoint to serve cached images
const getImageByUrl = async (req, res) => {
  const { filename } = req.params;
  
  try {
    const imagePath = path.join(__dirname, '../uploads/images', filename);
    const imageData = await fs.readFile(imagePath);
    
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    res.send(imageData);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(404).json({ message: 'Image not found' });
  }
};

module.exports = { generateImageFromPrompt, getImageByUrl };
