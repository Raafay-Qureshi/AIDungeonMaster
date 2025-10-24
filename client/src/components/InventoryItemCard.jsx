import React, { useState, useEffect } from 'react';
import api from '../api';
import LoadingSpinner from './LoadingSpinner';

const InventoryItemCard = ({ item, characterId, onClick }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If item already has a cached image URL, use it
        if (item.imageUrl) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1002/api';
            const fullImageUrl = `${API_URL}/images/${item.imageUrl}`;
            setImageUrl(fullImageUrl);
            return;
        }
        
        // Generate an image only if there's a prompt and we haven't already fetched it
        if (item.imagePrompt && !imageUrl && !item.imageUrl) {
            const generateImage = async () => {
                setIsLoading(true);
                try {
                    const response = await api.post(
                        '/images/generate',
                        {
                            prompt: item.imagePrompt,
                            itemName: item.itemName,
                            characterId: characterId
                        },
                        { responseType: 'blob' }
                    );
                    
                    // Create a blob URL for display
                    const blobUrl = URL.createObjectURL(response.data);
                    setImageUrl(blobUrl);
                } catch (err) {
                    console.error("Image generation failed for item:", item.itemName, err);
                } finally {
                    setIsLoading(false);
                }
            };
            generateImage();
        }
    }, [item.imagePrompt, item.imageUrl, characterId, item.itemName]);

    // Rarity colors (Fortnite-style)
    const rarityColors = {
        'Common': 'text-gray-400 border-gray-500',
        'Uncommon': 'text-green-400 border-green-500',
        'Rare': 'text-blue-400 border-blue-500',
        'Epic': 'text-purple-400 border-purple-500',
        'Legendary': 'text-yellow-400 border-yellow-500'
    };
    
    const rarityColor = rarityColors[item.rarity] || rarityColors['Common'];
    const textColor = rarityColor.split(' ')[0];
    const borderColor = rarityColor.split(' ')[1];

    return (
        <div
            className={`bg-gray-900 p-4 rounded-lg flex flex-col cursor-pointer hover:bg-gray-800 transition-colors border-2 ${borderColor}`}
            onClick={() => onClick(item)}
        >
            <div className="h-32 w-full bg-gray-800 rounded-md flex items-center justify-center mb-4">
                {isLoading && <LoadingSpinner />}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={item.itemName}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                            console.error('Image failed to load for:', item.itemName);
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                {!isLoading && !imageUrl && <p className="text-gray-500 text-sm">No Image</p>}
            </div>
            <div className="flex-grow">
                <p className={`font-bold ${textColor}`}>{item.itemName}</p>
                {item.rarity && (
                    <span className={`inline-block text-xs ${textColor} mt-1 font-semibold`}>
                        {item.rarity}
                    </span>
                )}
                <p className="text-sm text-gray-300 mt-1">{item.description}</p>
            </div>
            <p className="mt-2 text-xs font-mono bg-gray-700 self-start px-2 py-1 rounded">{item.type}</p>
        </div>
    );
};

export default InventoryItemCard;
