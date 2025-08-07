import React, { useState, useEffect } from 'react';
import api from '../api';
import LoadingSpinner from './LoadingSpinner';

const InventoryItemCard = ({ item }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Generate an image only if there's a prompt and we haven't already fetched it.
        if (item.imagePrompt && !imageUrl) {
            const generateImage = async () => {
                setIsLoading(true);
                try {
                    const response = await api.post(
                        '/images/generate',
                        { prompt: item.imagePrompt },
                        { responseType: 'blob' }
                    );
                    setImageUrl(URL.createObjectURL(response.data));
                } catch (err) {
                    console.error("Image generation failed for item:", item.itemName, err);
                } finally {
                    setIsLoading(false);
                }
            };
            generateImage();
        }
    }, [item.imagePrompt, imageUrl]);

    return (
        <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
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
