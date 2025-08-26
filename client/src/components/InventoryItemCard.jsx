import React, { useState, useEffect } from 'react';
import api from '../api';
import LoadingSpinner from './LoadingSpinner';

const InventoryItemCard = ({ item, characterId, onClick }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("InventoryItemCard useEffect triggered for item:", item.itemName);
        console.log("Item has imagePrompt:", !!item.imagePrompt);
        console.log("Item has cached imageUrl:", !!item.imageUrl);
        console.log("Current imageUrl:", imageUrl);
        
        // If item already has a cached image URL, use it
        if (item.imageUrl && !imageUrl) {
            console.log("Using cached image URL:", item.imageUrl);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1002/api';
            const fullImageUrl = `${API_URL}/images/${item.imageUrl}`;
            console.log("Full image URL:", fullImageUrl);
            setImageUrl(fullImageUrl);
            return;
        }
        
        // Generate an image only if there's a prompt and we haven't already fetched it.
        if (item.imagePrompt && !imageUrl && !item.imageUrl) {
            console.log("Starting image generation for:", item.itemName);
            const generateImage = async () => {
                setIsLoading(true);
                try {
                    console.log("Making API request to:", '/images/generate');
                    console.log("With prompt:", item.imagePrompt);
                    console.log("CharacterID:", characterId);
                    
                    const response = await api.post(
                        '/images/generate',
                        {
                            prompt: item.imagePrompt,
                            itemName: item.itemName,
                            characterId: characterId
                        },
                        { responseType: 'blob' }
                    );
                    console.log("API response received:", response);
                    setImageUrl(URL.createObjectURL(response.data));
                } catch (err) {
                    console.error("Image generation failed for item:", item.itemName, err);
                } finally {
                    setIsLoading(false);
                }
            };
            generateImage();
        }
    }, [item.imagePrompt, item.imageUrl, imageUrl, characterId, item.itemName]);

    return (
        <div
            className="bg-gray-900 p-4 rounded-lg flex flex-col cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => onClick(item)}
        >
            <div className="h-32 w-full bg-gray-800 rounded-md flex items-center justify-center mb-4">
                {isLoading && <LoadingSpinner />}
                {imageUrl && <img src={imageUrl} alt={item.itemName} className="h-full w-full object-contain" />}
                {!isLoading && !imageUrl && <p className="text-gray-500 text-sm">No Image</p>}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-yellow-400">{item.itemName}</p>
                <p className="text-sm text-gray-300 mt-1">{item.description}</p>
            </div>
            <p className="mt-2 text-xs font-mono bg-gray-700 self-start px-2 py-1 rounded">{item.type}</p>
        </div>
    );
};

export default InventoryItemCard;
