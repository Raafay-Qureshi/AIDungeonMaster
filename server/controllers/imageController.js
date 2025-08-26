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

    console.log(`Generating new image using Cloudflare Workers AI for prompt: "${prompt}"`);

    // Check for required environment variables
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      console.error("Missing Cloudflare credentials in environment variables");
      return res.status(500).json({
        message: "Image generation service not properly configured. Please contact administrator."
      });
    }

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        prompt: prompt
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // Important: Get binary data directly
      }
    );

    // The response from Cloudflare Workers AI is binary PNG data
    const imageData = response.data;
    if (!imageData) {
      throw new Error('No image data received from Cloudflare API');
    }

    // Convert array buffer to buffer
    const imageBuffer = Buffer.from(imageData);

    console.log(`Image generated successfully, response size: ${imageBuffer.length} bytes`);

    // Create uploads directory
    await createUploadsDir();

    // Save the image to disk and update database if characterId and itemName provided
    let savedImagePath = null;
    if (characterId && itemName) {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${itemName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
      const imagePath = path.join(__dirname, '../uploads/images', filename);
      
      // Save image to disk
      await fs.writeFile(imagePath, imageBuffer);
      savedImagePath = filename;

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
    // Parse error response if it's a buffer
    let errorMessage = error.message;
    if (error.response?.data) {
      try {
        const errorData = Buffer.isBuffer(error.response.data) 
          ? JSON.parse(error.response.data.toString()) 
          : error.response.data;
        console.error("Cloudflare Workers AI API Error:", errorData);
        errorMessage = errorData.errors?.[0]?.message || errorData.message || error.message;
      } catch (parseError) {
        console.error("Error parsing Cloudflare response:", error.response.data);
      }
    }
    
    console.error("Cloudflare Workers AI image generation failed:", errorMessage);
    
    // Handle different types of errors
    if (error.response?.status === 401) {
      return res.status(500).json({
        message: "Image generation service authentication failed. Please contact administrator.",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    } else if (error.response?.status === 429) {
      return res.status(429).json({
        message: "Image generation service is currently rate limited. Please try again in a moment."
      });
    } else if (error.response?.status >= 500) {
      return res.status(500).json({
        message: "Image generation service is temporarily unavailable. Please try again later."
      });
    } else {
      return res.status(500).json({
        message: "Image generation failed. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
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
