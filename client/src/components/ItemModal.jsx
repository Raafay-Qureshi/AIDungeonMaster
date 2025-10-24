import React, { useState } from 'react';
import api from '../api';
import useAuthStore from '../store/authStore';

const ItemModal = ({ item, isOpen, onClose }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { setCharacter } = useAuthStore();

    if (!isOpen || !item) return null;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1002/api';
    const imageUrl = item.imageUrl ? `${API_URL}/images/${item.imageUrl}` : null;
    
    // Rarity colors (Fortnite-style)
    const rarityColors = {
        'Common': 'text-gray-400 border-gray-500 bg-gray-700',
        'Uncommon': 'text-green-400 border-green-500 bg-green-900/30',
        'Rare': 'text-blue-400 border-blue-500 bg-blue-900/30',
        'Epic': 'text-purple-400 border-purple-500 bg-purple-900/30',
        'Legendary': 'text-yellow-400 border-yellow-500 bg-yellow-900/30'
    };
    
    const rarityColor = rarityColors[item.rarity] || rarityColors['Common'];
    
    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${item.itemName}?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await api.delete(`/users/inventory/${encodeURIComponent(item.itemName)}`);
            setCharacter(response.data.character);
            onClose();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className={`text-2xl font-bold ${rarityColor.split(' ')[0]}`}>{item.itemName}</h2>
                        {item.rarity && (
                            <span className={`inline-block mt-2 px-3 py-1 rounded border ${rarityColor} text-sm font-semibold`}>
                                {item.rarity}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Enlarged Image */}
                <div className={`mb-6 border-2 rounded-lg ${rarityColor.split(' ').slice(1).join(' ')}`}>
                    {imageUrl ? (
                        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt={item.itemName}
                                className="max-w-full max-h-96 object-contain rounded"
                                onLoad={(e) => console.log('Image loaded successfully:', imageUrl)}
                                onError={(e) => {
                                    console.error('Image failed to load:', imageUrl);
                                    e.target.parentElement.innerHTML = '<p class="text-gray-500">Image failed to load</p>';
                                }}
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-900 rounded-lg p-8 flex items-center justify-center">
                            <p className="text-gray-500">Generating image...</p>
                        </div>
                    )}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Description</h3>
                        <p className="text-gray-400">{item.description || 'No description available'}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Type</h3>
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded font-mono text-sm">
                            {item.type || 'Unknown'}
                        </span>
                    </div>

                    {/* Quest and Project Information */}
                    {(item.questName || item.projectName) && (
                        <div className="border-t border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">Source</h3>
                            <div className="space-y-2">
                                {item.projectName && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-400 font-medium">Project:</span>
                                        <span className="text-gray-300">{item.projectName}</span>
                                    </div>
                                )}
                                {item.questName && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-400 font-medium">Quest:</span>
                                        <span className="text-gray-300">{item.questName}</span>
                                    </div>
                                )}
                                {item.completedAt && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-purple-400 font-medium">Obtained:</span>
                                        <span className="text-gray-300">
                                            {new Date(item.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Item'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;